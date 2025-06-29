
'use client';

import { useState, useEffect, Suspense, useMemo, useTransition } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { EnergyLogForm } from './EnergyLogForm';
import { Timeline } from './Timeline';
import { EnergyTrendsChart } from './EnergyTrendsChart';
import { getEnergyLogAction, EnergyLog } from '@/app/actions';
import { getAIAnalysis, AnalyzeEnergyOutput } from '@/ai/flows/analyze-energy-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { format, isValid, startOfDay, isAfter, isBefore } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EnergyTrackerComponentProps {
  initialLog: EnergyLog | null;
  initialRecentLogs: EnergyLog[];
  initialDateString: string;
  initialTimestamp: number;
}

function EnergyTrackerContent({ initialLog, initialRecentLogs, initialDateString, initialTimestamp }: EnergyTrackerComponentProps) {
  const serverDeterminedToday = useMemo(() => new Date(initialTimestamp), [initialTimestamp]);
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState<Date>(serverDeterminedToday);
  const [currentLog, setCurrentLog] = useState<EnergyLog | null>(initialLog);
  const [recentLogs, setRecentLogs] = useState<EnergyLog[]>(initialRecentLogs);
  const [isLoadingLog, setIsLoadingLog] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, startAnalyzingTransition] = useTransition();


  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  useEffect(() => {
    const newServerToday = new Date(initialTimestamp);
    setSelectedDate(newServerToday);
    setCurrentLog(initialLog);
    setAiAnalysis(null);
  }, [initialTimestamp, initialLog]);


  useEffect(() => {
    const fetchLogForSelectedDate = async () => {
      if (!selectedDate || !isValid(selectedDate)) return;

      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      
      setAiAnalysis(null);

      if (selectedDateStr === initialDateString) {
        setCurrentLog(initialLog);
      } else {
        setIsLoadingLog(true);
        try {
          const log = await getEnergyLogAction(selectedDateStr);
          setCurrentLog(log);
        } catch (error) {
          console.error("Failed to fetch energy log for date:", selectedDateStr, error);
          setCurrentLog(null);
          toast({ title: "Error", description: "Could not fetch log for the selected date.", variant: "destructive"});
        } finally {
          setIsLoadingLog(false);
        }
      }
    };
    
    if (isClientMounted) {
        if (selectedDate.getTime() !== serverDeterminedToday.getTime() || 
            (selectedDate.getTime() === serverDeterminedToday.getTime() && currentLog !== initialLog) ) {
             fetchLogForSelectedDate();
        } else if (selectedDate.getTime() === serverDeterminedToday.getTime() && currentLog === null && initialLog === null) {
            fetchLogForSelectedDate();
        } else if (selectedDate.getTime() === serverDeterminedToday.getTime() && currentLog !== initialLog) {
            setCurrentLog(initialLog);
            setAiAnalysis(null); 
        }
    }
  }, [selectedDate, initialLog, initialDateString, isClientMounted, serverDeterminedToday, currentLog, toast]);


  useEffect(() => {
    setRecentLogs(initialRecentLogs);
    setAiAnalysis(null); 
  }, [initialRecentLogs]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      setSelectedDate(startOfDay(date));
    }
  };

  const handleGetAIAnalysis = () => {
    if (recentLogs.length < 2) { 
        toast({
            title: "Not Enough Data",
            description: "Please log at least two days to get an AI analysis. Keep logging your vibes!",
            variant: "default"
        });
        return;
    }
    startAnalyzingTransition(async () => {
        setAiAnalysis(null); 
        try {
            const result: AnalyzeEnergyOutput = await getAIAnalysis(recentLogs); 
            setAiAnalysis(result.analysis);
        } catch (error) {
            console.error("Error fetching AI analysis:", error);
            setAiAnalysis("Sorry, I couldn't fetch an analysis at this moment. Please try again later.");
            toast({ title: "AI Analysis Error", description: "Could not generate analysis. Please try again.", variant: "destructive"});
        }
    });
  };

  const dateToCompareForDisabling = isClientMounted ? startOfDay(new Date()) : serverDeterminedToday;
  const earliestAllowedDate = useMemo(() => startOfDay(new Date("2000-01-01")), []);

  return (
    <div className="container mx-auto py-6 md:py-8 px-4">
      <div className="flex flex-col gap-6 md:gap-8">
        
        <Card className="shadow-lg rounded-xl overflow-hidden">
          <CardHeader>
            <CardTitle className="font-headline">Select Date</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border-0 w-full"
              today={serverDeterminedToday}
              disabled={(date) => {
                const dayToTest = startOfDay(date);
                return isAfter(dayToTest, dateToCompareForDisabling) || isBefore(dayToTest, earliestAllowedDate);
              }}
            />
          </CardContent>
        </Card>
        
        {isLoadingLog ? (
          <Card className="shadow-lg rounded-xl">
            <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-full" /> 
              <Skeleton className="h-10 w-full" /> 
            </CardContent>
            <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
          </Card>
        ) : (
          <EnergyLogForm selectedDate={selectedDate} currentLog={currentLog} />
        )}
      
        <Timeline logs={recentLogs} />
      
        <EnergyTrendsChart logs={recentLogs} />

        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Vibe Analysis by AI
            </CardTitle>
            <CardDescription>Get insights into your energy patterns from your recent logs.</CardDescription>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : aiAnalysis ? (
              <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\n/g, '<br />') }}></div>
            ) : (
              <p className="text-muted-foreground">Click the button below to generate an analysis of your recent vibes (needs at least 2 logs).</p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleGetAIAnalysis} 
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isAnalyzing ? 'Analyzing...' : 'Get Vibe Analysis'}
            </Button>
          </CardFooter>
        </Card>
        
      </div>
    </div>
  );
}

export function EnergyTrackerComponent(props: EnergyTrackerComponentProps) {
  const key = `${props.initialDateString}-${props.initialRecentLogs.map(l => l.id).join(',')}-${props.initialTimestamp}`; 
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading Energy Tracker...</div>}>
      <EnergyTrackerContent {...props} key={key} />
    </Suspense>
  );
}

