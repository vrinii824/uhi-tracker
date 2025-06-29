
import { Header } from '@/components/Header';
import { EnergyTrackerComponent } from '@/components/energy/EnergyTrackerComponent';
import { getRecentEnergyLogsAction, getEnergyLogAction, EnergyLog } from '@/app/actions';
import { format, startOfDay } from 'date-fns';

export default async function HomePage() {
  const serverNow = new Date();
  const todayString = format(serverNow, 'yyyy-MM-dd');
  const todayTimestamp = startOfDay(serverNow).getTime(); 

  let initialLogData: EnergyLog | null = null;
  let recentLogsData: EnergyLog[] = [];

  try {
    initialLogData = await getEnergyLogAction(todayString);
    recentLogsData = await getRecentEnergyLogsAction(7);
  } catch (error) {
    console.error("Error fetching initial data for Vibe Vault:", error);
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <EnergyTrackerComponent 
          initialLog={initialLogData} 
          initialRecentLogs={recentLogsData}
          initialDateString={todayString}
          initialTimestamp={todayTimestamp} 
        />
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        Vibe Vault &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
