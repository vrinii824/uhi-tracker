import { EnergyLog } from '@/app/actions'; // Updated type to EnergyLog
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Zap } from 'lucide-react'; // Kept Zap for energy

interface LogDisplayCardProps {
  log: EnergyLog; // Updated type
}

export function LogDisplayCard({ log }: LogDisplayCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline">{format(log.date, 'EEE, MMM d')}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-start text-sm"> {/* Changed to justify-start */}
        <div className="flex items-center gap-2 text-foreground">
          <Zap className="h-5 w-5 text-yellow-400" />
          <span>Energy: {log.energy}/10</span>
        </div>
      </CardContent>
    </Card>
  );
}
