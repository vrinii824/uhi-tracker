import { EnergyLog } from '@/app/actions'; // Updated type to EnergyLog
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogDisplayCard } from './LogDisplayCard';

interface TimelineProps {
  logs: EnergyLog[]; // Updated type
}

export function Timeline({ logs }: TimelineProps) {
  return (
    <Card className="shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="font-headline">Recent Energy Levels</CardTitle>
        <CardDescription>Your energy levels over the last few entries.</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No recent energy logs found. Start tracking your energy!</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <LogDisplayCard key={log.id} log={log} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
