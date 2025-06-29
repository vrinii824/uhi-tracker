import { EnergyLog, EmotionTag, WeatherType, ActivityType, SocialInteractionType, WorkloadRating, MenstrualCyclePhaseType, ActivityIntensity } from '@/app/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import {
  Zap, NotebookText, Activity as ActivityIcon, Droplets,
  Smile, Bed, CloudSun, TrendingUp, ScrollText, Target, Flame, Award,
  Cloud, CloudRain, CloudSnow, Wind, CloudFog, Meh, HeartPulse,
  Star, Clock, Coffee, Wine, Cookie, Utensils, Dumbbell, Timer, Brain, ShieldAlert, Pill, Users, Briefcase, CalendarHeart, Thermometer, Drama, CircleSlash, Moon, Sunrise, FileText
} from 'lucide-react';

interface LogDisplayCardProps {
  log: EnergyLog;
}

const WeatherIcon = ({ type }: { type: WeatherType | undefined }) => {
  switch (type) {
    case "Sunny": return <CloudSun className="h-5 w-5 text-orange-400" />;
    case "Cloudy": return <Cloud className="h-5 w-5 text-gray-400" />;
    case "Rainy": return <CloudRain className="h-5 w-5 text-blue-400" />;
    case "Snowy": return <CloudSnow className="h-5 w-5 text-blue-200" />;
    case "Windy": return <Wind className="h-5 w-5 text-teal-400" />;
    case "Foggy": return <CloudFog className="h-5 w-5 text-slate-400" />;
    case "Stormy": return <Thermometer className="h-5 w-5 text-purple-400" />; // Using Thermometer as proxy
    default: return <CloudSun className="h-5 w-5 text-gray-400" />; 
  }
};

const EmotionIcon = ({ tag }: {tag: EmotionTag | undefined}) => {
    switch(tag) {
        case "Happy": case "Content": case "Grateful": case "Excited": case "Optimistic": return <Smile className="h-5 w-5 text-yellow-500" />;
        case "Energetic": case "Productive": case "Focused": return <Zap className="h-5 w-5 text-orange-500" />;
        case "Motivated": case "Inspired": return <HeartPulse className="h-5 w-5 text-pink-500" />;
        case "Calm": case "Relaxed": case "Peaceful": return <Moon className="h-5 w-5 text-green-500" />; // Using Moon for calm
        case "Neutral": case "Okay": return <Meh className="h-5 w-5 text-gray-500" />;
        case "Stressed": case "Anxious": case "Overwhelmed": case "Worried": return <Brain className="h-5 w-5 text-red-500" />;
        case "Sad": case "Disappointed": case "Lonely": case "Grieving": return <Drama className="h-5 w-5 text-blue-500" />; // Using Drama for sad
        case "Tired": case "Fatigued": case "Exhausted": return <Bed className="h-5 w-5 text-indigo-400" />;
        case "Irritable": case "Frustrated": case "Angry": return <CircleSlash className="h-5 w-5 text-red-700" />; // Using CircleSlash for angry
        default: return <Smile className="h-5 w-5 text-gray-400" />; 
    }
};

const RatingStars = ({ rating, max = 5, iconColor = "text-yellow-400" }: { rating: number | undefined, max?: number, iconColor?: string }) => {
  if (typeof rating !== 'number') return null;
  return (
    <div className="flex">
      {[...Array(max)].map((_, i) => (
        <Star key={i} className={`h-4 w-4 ${i < rating ? `fill-current ${iconColor}` : iconColor}`} />
      ))}
    </div>
  );
};


export function LogDisplayCard({ log }: LogDisplayCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
            <CardTitle className="text-lg font-headline">{format(log.date, 'EEE, MMM d')}</CardTitle>
            {log.rewardBadge && (
                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                    <Award className="h-4 w-4" />
                    <span>{log.rewardBadge}</span>
                </div>
            )}
        </div>
        {typeof log.logStreakCount === 'number' && log.logStreakCount > 0 && (
             <div className="flex items-center gap-1 text-sm text-orange-500">
                <Flame className="h-5 w-5" />
                <span>{log.logStreakCount}-day streak</span>
            </div>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 text-sm p-4 pt-0">
        {/* Core */}
        <div className="flex items-center gap-2 text-foreground">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span>Energy: {log.energy}/10</span>
        </div>
        {log.energyGoal !== undefined && (
          <div className="flex items-center gap-2 text-foreground">
            <Target className="h-5 w-5 text-red-400" />
            <span>Goal: {log.energyGoal}/10</span>
          </div>
        )}
         {log.note && (
          <div className="md:col-span-2 lg:col-span-3 flex items-start gap-2 text-foreground pt-1">
            <NotebookText className="h-5 w-5 text-purple-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground flex-grow break-words">Note: {log.note}</p>
          </div>
        )}

        {/* Sleep */}
        {typeof log.sleepHours === 'number' && (
          <div className="flex items-center gap-2 text-foreground">
            <Bed className="h-5 w-5 text-indigo-500" />
            <span>Sleep: {log.sleepHours} hrs</span>
          </div>
        )}
        {log.sleepQuality !== undefined && (
          <div className="flex items-center gap-2 text-foreground">
            <Star className="h-5 w-5 text-yellow-400" />
            <span>Quality: <RatingStars rating={log.sleepQuality} /></span>
          </div>
        )}
        {log.bedtime && (
          <div className="flex items-center gap-2 text-foreground">
            <Bed className="h-5 w-5 text-gray-500" /> 
            <span>Bedtime: {log.bedtime}</span>
          </div>
        )}
        {log.wakeUpTime && (
          <div className="flex items-center gap-2 text-foreground">
            <Sunrise className="h-5 w-5 text-orange-400" />
            <span>Wake-up: {log.wakeUpTime}</span>
          </div>
        )}
        {log.sleepNotes && (
          <div className="md:col-span-full flex items-start gap-2 text-foreground pt-1">
            <FileText className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground flex-grow break-words">Sleep Notes: {log.sleepNotes}</p>
          </div>
        )}
        
        {/* Diet & Hydration */}
        <div className="flex items-center gap-2 text-foreground">
          <Droplets className="h-5 w-5 text-blue-500" />
          <span>Hydration: {log.hydrationLiters} L</span>
        </div>
        {log.sugarIntakeRating !== undefined && (
          <div className="flex items-center gap-2 text-foreground">
            <Cookie className="h-5 w-5 text-amber-600" />
            <span>Sugar: <RatingStars rating={log.sugarIntakeRating} iconColor="text-amber-600" /></span>
          </div>
        )}
        {log.mealTags && (
          <div className="flex items-center gap-2 text-foreground">
            <Utensils className="h-5 w-5 text-green-600" />
            <span className="text-xs">Meals: {log.mealTags}</span>
          </div>
        )}
        {log.caffeineIntake && (
          <div className="flex items-center gap-2 text-foreground">
            <Coffee className="h-5 w-5 text-yellow-800" />
            <span className="text-xs">Caffeine: {log.caffeineIntake}</span>
          </div>
        )}
        {log.alcoholIntake && (
          <div className="flex items-center gap-2 text-foreground">
            <Wine className="h-5 w-5 text-purple-600" />
            <span className="text-xs">Alcohol: {log.alcoholIntake}</span>
          </div>
        )}

        {/* Activity */}
        {log.activityType && (
          <div className="flex items-center gap-2 text-foreground">
            <Dumbbell className="h-5 w-5 text-cyan-500" />
            <span>Activity: {log.activityType}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-foreground">
          <ActivityIcon className="h-5 w-5 text-green-500" />
          <span>Intensity: {log.activityIntensity}</span>
        </div>
        {typeof log.activityDurationMinutes === 'number' && log.activityDurationMinutes > 0 && (
          <div className="flex items-center gap-2 text-foreground">
            <Timer className="h-5 w-5 text-gray-500" />
            <span>Duration: {log.activityDurationMinutes} min</span>
          </div>
        )}

        {/* Mood & Stress */}
        {log.emotionTag && (
          <div className="flex items-center gap-2 text-foreground">
            <EmotionIcon tag={log.emotionTag} />
            <span>{log.emotionTag}</span>
          </div>
        )}
        {log.stressLevel !== undefined && (
          <div className="flex items-center gap-2 text-foreground">
            <Brain className="h-5 w-5 text-red-500" />
            <span>Stress: <RatingStars rating={log.stressLevel} iconColor="text-red-500" /></span>
          </div>
        )}
        
        {/* Health & Symptoms */}
        {log.generalHealthRating !== undefined && (
          <div className="flex items-center gap-2 text-foreground">
            <HeartPulse className="h-5 w-5 text-pink-500" />
            <span>Health: <RatingStars rating={log.generalHealthRating} iconColor="text-pink-500" /></span>
          </div>
        )}
        {log.symptoms && (
          <div className="flex items-center gap-2 text-foreground">
            <ShieldAlert className="h-5 w-5 text-orange-500" />
            <span className="text-xs">Symptoms: {log.symptoms}</span>
          </div>
        )}
        {log.medicationTaken && (
          <div className="flex items-center gap-2 text-foreground">
            <Pill className="h-5 w-5 text-teal-500" />
            <span className="text-xs">Meds: {log.medicationTaken}</span>
          </div>
        )}

        {/* Environment & Other */}
        {log.weatherType && (
          <div className="flex items-center gap-2 text-foreground">
            <WeatherIcon type={log.weatherType} />
            <span>{log.weatherType}</span>
          </div>
        )}
        {log.socialInteractions && (
          <div className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-blue-400" />
            <span>Social: {log.socialInteractions}</span>
          </div>
        )}
         {log.workload && (
          <div className="flex items-center gap-2 text-foreground">
            <Briefcase className="h-5 w-5 text-gray-600" />
            <span>Workload: {log.workload}</span>
          </div>
        )}
        {log.menstrualCyclePhase && log.menstrualCyclePhase !== "None" && log.menstrualCyclePhase !== "Unknown" && (
          <div className="flex items-center gap-2 text-foreground">
            <CalendarHeart className="h-5 w-5 text-rose-500" />
            <span>Cycle: {log.menstrualCyclePhase}</span>
          </div>
        )}

        {/* Journal */}
        {log.journalNote && (
          <div className="md:col-span-full flex items-start gap-2 text-foreground pt-1">
            <ScrollText className="h-5 w-5 text-pink-500 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground flex-grow break-words">Journal: {log.journalNote}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
