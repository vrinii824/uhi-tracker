
'use client';

import { useState, useEffect, Suspense } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { EnergyLogForm } from './WellnessLogForm'; // Renamed to EnergyLogForm
import { Timeline } from './Timeline';
import { getEnergyLogAction, getRecentEnergyLogsAction, EnergyLog } from '@/app/actions'; // Updated actions and types
import { Skeleton } from '@/components/ui/skeleton';
import { format, isValid } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface EnergyTrackerComponentProps { // Renamed props
  initialLog: EnergyLog | null; // Updated type
  initialRecentLogs: EnergyLog[]; // Updated type
  initialDateString: string; 
}

function EnergyTrackerContent({ initialLog, initialRecentLogs, initialDateString }: EnergyTrackerComponentProps) { // Renamed
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(initialDateString + 'T00:00:00'));
  const [currentLog, setCurrentLog] = useState<EnergyLog | null>(initialLog); // Updated type
  const [recentLogs, setRecentLogs] = useState<EnergyLog[]>(initialRecentLogs); // Updated type
  const [isLoadingLog, setIsLoadingLog] = useState(false);

  useEffect(() => {
    const parsedDate = new Date(initialDateString + 'T00:00:00');
    if (isValid(parsedDate)) {
      setSelectedDate(parsedDate);
      setCurrentLog(initialLog);
    }
  }, [initialDateString, initialLog]);

  useEffect(() => {
    const fetchLogForDate = async () => {
      if (!selectedDate || !isValid(selectedDate)) return;
      setIsLoadingLog(true);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      try {
        const log = await getEnergyLogAction(dateString); // Updated action
        setCurrentLog(log);
      } catch (error) {
        console.error("Failed to fetch energy log for date:", error);
        setCurrentLog(null);
      } finally {
        setIsLoadingLog(false);
      }
    };

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    if (dateString === initialDateString && currentLog === initialLog) {
      // Do nothing
    } else {
       fetchLogForDate();
    }
  }, [selectedDate, initialDateString, initialLog]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const logs = await getRecentEnergyLogsAction(7); // Updated action
        setRecentLogs(logs);
      } catch (error) {
        console.error("Failed to fetch recent energy logs:", error);
      }
    };
    if (initialRecentLogs.length === 0) {
        // fetchRecent(); // Can be enabled if needed
    } else {
        setRecentLogs(initialRecentLogs);
    }
  }, [initialRecentLogs]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      setSelectedDate(date);
    }
  };

  return (
    <div className="container mx-auto py-6 md:py-8 px-4">
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-1 flex flex-col gap-6">
          <Card className="shadow-lg rounded-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="font-headline">Select Date</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md border"
                disabled={(date) => date > new Date() || date < new Date("2000-01-01")}
              />
            </CardContent>
          </Card>
          
          {isLoadingLog ? (
            <Card className="shadow-lg rounded-xl">
              <CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
              <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
            </Card>
          ) : (
            <EnergyLogForm selectedDate={selectedDate} currentLog={currentLog} /> // Renamed component
          )}
        </div>

        <div className="md:col-span-2">
          <Timeline logs={recentLogs} />
        </div>
      </div>
    </div>
  );
}

// Renaming the main exported component and its props
export function EnergyTrackerComponent(props: EnergyTrackerComponentProps) {
  return (
    <Suspense fallback={<div>Loading Energy Tracker...</div>}>
      <EnergyTrackerContent {...props} key={props.initialDateString} />
    </Suspense>
  );
}

// To maintain compatibility if src/app/page.tsx was importing WellnessTracker
// You might need to update the import in page.tsx to EnergyTrackerComponent
// For now, I'm renaming the main component directly. If an alias is needed,
// we can add: export { EnergyTrackerComponent as WellnessTracker };
// But direct renaming is cleaner.
