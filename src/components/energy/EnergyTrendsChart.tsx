// This component was simplified to a placeholder due to persistent parsing errors.
// Restoring its original charting capabilities.
// If parsing errors resurface, the issue might be environmental or within the charting logic itself.
'use client';

import type { EnergyLog, ActivityIntensity } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';


// Helper function to map activity intensity to a numeric value for charting
const mapActivityIntensityToNumeric = (intensity: ActivityIntensity | undefined): number => {
  if (!intensity) return 0;
  switch (intensity) {
    case 'None': return 1;
    case 'Low': return 2;
    case 'Medium': return 3;
    case 'High': return 4;
    default: return 0;
  }
};

interface EnergyTrendsChartProps {
  logs: EnergyLog[];
}

export function EnergyTrendsChart({ logs }: EnergyTrendsChartProps) {
  if (!logs || logs.length < 1) { // Changed to < 1 for single data point display
    return (
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline">Vibe Trends</CardTitle>
          <CardDescription>Not enough data to display trends yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Log at least one entry to see your trends.</p>
        </CardContent>
      </Card>
    );
  }

  const sortedLogs = useMemo(() => 
    [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), 
  [logs]);

  const chartData = useMemo(() => 
    sortedLogs.map(log => ({
      date: format(new Date(log.date), 'MMM d'),
      energy: log.energy,
      activity: mapActivityIntensityToNumeric(log.activityIntensity),
      fatigue: 10 - log.energy, // Example derived metric
      sleepHours: log.sleepHours ?? null, // Use null for missing data in charts
      stressLevel: log.stressLevel ?? null,
    })), 
  [sortedLogs]);

  const energyChartConfig = {
    energy: { label: 'Energy Level', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig;

  const activityFatigueChartConfig = {
    activity: { label: 'Activity Intensity', color: 'hsl(var(--chart-2))' },
    fatigue: { label: 'Estimated Fatigue', color: 'hsl(var(--chart-3))' },
  } satisfies ChartConfig;
  
  const sleepEnergyChartConfig = {
    sleepHours: { label: 'Sleep Hours', color: 'hsl(var(--chart-4))' },
    energy: { label: 'Energy Level', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig;

  const stressEnergyChartConfig = {
    stressLevel: { label: 'Stress Level', color: 'hsl(var(--chart-5))' },
    energy: { label: 'Energy Level', color: 'hsl(var(--chart-1))' },
  } satisfies ChartConfig;

  // Check if there's any sleep data to determine if sleep chart should be rendered
  const sleepDataPresent = useMemo(() => logs.some(log => typeof log.sleepHours === 'number' && log.sleepHours > 0), [logs]);
  const stressDataPresent = useMemo(() => logs.some(log => typeof log.stressLevel === 'number' && log.stressLevel > 0), [logs]);


  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline">Energy Levels Over Time</CardTitle>
          <CardDescription>Your daily energy trend.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={energyChartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis domain={[0, 10]} tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} tickFormatter={(value) => `${value}`} />
                <ChartTooltip 
                    content={<ChartTooltipContent hideIndicator />} 
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                />
                <Legend />
                <Line type="monotone" dataKey="energy" strokeWidth={2} stroke="var(--color-energy, hsl(var(--chart-1)))" dot={{ r: 4, fill: 'var(--color-energy, hsl(var(--chart-1)))', strokeWidth:1, stroke: 'hsl(var(--background))' }} activeDot={{r:6}} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="font-headline">Activity &amp; Estimated Fatigue</CardTitle>
          <CardDescription>How activity levels might correlate with fatigue.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={activityFatigueChartConfig} className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis domain={[0, 10]} tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} />
                 <ChartTooltip 
                    content={<ChartTooltipContent indicator="dot" />}
                    cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
                />
                <Legend />
                <Bar dataKey="activity" fill="var(--color-activity, hsl(var(--chart-2)))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fatigue" fill="var(--color-fatigue, hsl(var(--chart-3)))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {sleepDataPresent && (
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline">Sleep Hours vs. Energy</CardTitle>
            <CardDescription>Correlation between sleep duration and energy levels.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sleepEnergyChartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} />
                  <YAxis yAxisId="left" domain={[0, 12]} tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} label={{ value: 'Sleep (hrs)', angle: -90, position: 'insideLeft', fill:'hsl(var(--foreground))', fontSize:10, dy:40 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} label={{ value: 'Energy (1-10)', angle: 90, position: 'insideRight', fill:'hsl(var(--foreground))', fontSize:10, dy:-40 }} />
                  <ChartTooltip 
                    content={<ChartTooltipContent hideIndicator />}
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                   />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="sleepHours" strokeWidth={2} stroke="var(--color-sleepHours, hsl(var(--chart-4)))" dot={{ r: 4, fill: 'var(--color-sleepHours, hsl(var(--chart-4)))', strokeWidth:1, stroke: 'hsl(var(--background))' }} activeDot={{r:6}} name="Sleep Hours" />
                  <Line yAxisId="right" type="monotone" dataKey="energy" strokeWidth={2} stroke="var(--color-energy, hsl(var(--chart-1)))" dot={{ r: 4, fill: 'var(--color-energy, hsl(var(--chart-1)))', strokeWidth:1, stroke: 'hsl(var(--background))' }} activeDot={{r:6}} name="Energy Level" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {stressDataPresent && (
         <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline">Stress Level vs. Energy</CardTitle>
            <CardDescription>Correlation between stress levels and energy.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={stressEnergyChartConfig} className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} />
                  <YAxis yAxisId="left" domain={[0, 5]} tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} label={{ value: 'Stress (1-5)', angle: -90, position: 'insideLeft', fill:'hsl(var(--foreground))', fontSize:10, dy:20 }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tickLine={false} axisLine={false} stroke="hsl(var(--foreground))" fontSize={12} label={{ value: 'Energy (1-10)', angle: 90, position: 'insideRight', fill:'hsl(var(--foreground))', fontSize:10, dy:-40 }} />
                  <ChartTooltip 
                    content={<ChartTooltipContent hideIndicator />}
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                   />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="stressLevel" strokeWidth={2} stroke="var(--color-stressLevel, hsl(var(--chart-5)))" dot={{ r: 4, fill: 'var(--color-stressLevel, hsl(var(--chart-5)))', strokeWidth:1, stroke: 'hsl(var(--background))' }} activeDot={{r:6}} name="Stress Level" />
                  <Line yAxisId="right" type="monotone" dataKey="energy" strokeWidth={2} stroke="var(--color-energy, hsl(var(--chart-1)))" dot={{ r: 4, fill: 'var(--color-energy, hsl(var(--chart-1)))', strokeWidth:1, stroke: 'hsl(var(--background))' }} activeDot={{r:6}} name="Energy Level" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
