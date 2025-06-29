
'use client';

import { useEffect, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { EnergySlider } from './EnergySlider';
import { 
  saveEnergyLogAction, EnergyLog, EnergyLogInput, EmotionTag, WeatherType, ActivityIntensity,
  SleepQualityRating, StressLevelRating, GeneralHealthRating, SugarIntakeRating, ActivityType,
  SocialInteractionType, WorkloadRating, MenstrualCyclePhaseType
} from '@/app/actions';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

const activityIntensities: ActivityIntensity[] = ["None", "Low", "Medium", "High"];
const emotionTags: EmotionTag[] = [
  "Happy", "Content", "Grateful", "Excited", "Optimistic", "Neutral", "Okay", 
  "Calm", "Relaxed", "Peaceful", "Stressed", "Anxious", "Overwhelmed", "Worried", 
  "Sad", "Disappointed", "Lonely", "Grieving", "Energetic", "Productive", "Focused", 
  "Motivated", "Inspired", "Tired", "Fatigued", "Exhausted", "Irritable", "Frustrated", "Angry", "Other"
];
const weatherTypes: WeatherType[] = ["Sunny", "Cloudy", "Rainy", "Snowy", "Windy", "Foggy", "Stormy", "Other"];
const sleepQualityRatings: SleepQualityRating[] = [1, 2, 3, 4, 5];
const stressLevelRatings: StressLevelRating[] = [1, 2, 3, 4, 5];
const generalHealthRatings: GeneralHealthRating[] = [1, 2, 3, 4, 5];
const sugarIntakeRatings: SugarIntakeRating[] = [1, 2, 3, 4, 5];
const activityTypes: ActivityType[] = [
  "Gym", "Running", "Walking", "Cycling", "Swimming", "Yoga", "Pilates", 
  "Sports", "Strength Training", "HIIT", "Dance", "Hiking", "Housework", 
  "Gardening", "Stretching", "Rest Day", "Sedentary", "Other"
];
const socialInteractionTypes: SocialInteractionType[] = ["Positive", "Neutral", "Negative", "Draining", "None"];
const workloadRatings: WorkloadRating[] = ["Low", "Medium", "High", "Overloaded"];
const menstrualCyclePhaseTypes: MenstrualCyclePhaseType[] = ["Menstruation", "Follicular", "Ovulation", "Luteal", "None", "Unknown"];


const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const formSchema = z.object({
  energy: z.number().min(1).max(10),
  note: z.string().max(500).optional(),
  
  // Sleep
  sleepHours: z.coerce.number().min(0).max(24).step(0.25).optional().nullable(),
  sleepQuality: z.coerce.number().min(1).max(5).optional().nullable() as z.ZodType<SleepQualityRating | null | undefined>,
  bedtime: z.string().regex(timeRegex, { message: "Invalid time format. Use HH:MM" }).optional().nullable(),
  wakeUpTime: z.string().regex(timeRegex, { message: "Invalid time format. Use HH:MM" }).optional().nullable(),
  sleepNotes: z.string().max(500).optional(),

  // Diet & Hydration
  hydrationLiters: z.coerce.number().min(0).max(10),
  mealTags: z.string().max(500).optional(),
  caffeineIntake: z.string().max(100).optional(),
  alcoholIntake: z.string().max(100).optional(),
  sugarIntakeRating: z.coerce.number().min(1).max(5).optional().nullable() as z.ZodType<SugarIntakeRating | null | undefined>,

  // Activity
  activityType: z.enum(activityTypes).optional().nullable(),
  activityIntensity: z.enum(activityIntensities),
  activityDurationMinutes: z.coerce.number().min(0).optional().nullable(),

  // Stress & Mood
  emotionTag: z.enum(emotionTags).optional().nullable(),
  stressLevel: z.coerce.number().min(1).max(5).optional().nullable() as z.ZodType<StressLevelRating | null | undefined>,
  
  // Health & Symptoms
  generalHealthRating: z.coerce.number().min(1).max(5).optional().nullable() as z.ZodType<GeneralHealthRating | null | undefined>,
  symptoms: z.string().max(500).optional(),
  medicationTaken: z.string().max(200).optional(),

  // Environment
  weatherType: z.enum(weatherTypes).optional().nullable(),
  socialInteractions: z.enum(socialInteractionTypes).optional().nullable(),
  workload: z.enum(workloadRatings).optional().nullable(),
  menstrualCyclePhase: z.enum(menstrualCyclePhaseTypes).optional().nullable(),

  // Journaling & Goals
  journalNote: z.string().max(2000).optional(),
  energyGoal: z.coerce.number().min(1).max(10).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface EnergyLogFormProps {
  selectedDate: Date;
  currentLog: EnergyLog | null;
}

export function EnergyLogForm({ selectedDate, currentLog }: EnergyLogFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      energy: currentLog?.energy || 5,
      note: currentLog?.note || '',
      // Sleep
      sleepHours: currentLog?.sleepHours ?? 7.0,
      sleepQuality: currentLog?.sleepQuality ?? 3,
      bedtime: currentLog?.bedtime || '',
      wakeUpTime: currentLog?.wakeUpTime || '',
      sleepNotes: currentLog?.sleepNotes || '',
      // Diet & Hydration
      hydrationLiters: currentLog?.hydrationLiters ?? 1.5,
      mealTags: currentLog?.mealTags || '',
      caffeineIntake: currentLog?.caffeineIntake || '',
      alcoholIntake: currentLog?.alcoholIntake || '',
      sugarIntakeRating: currentLog?.sugarIntakeRating ?? 3,
      // Activity
      activityType: currentLog?.activityType || 'Sedentary',
      activityIntensity: currentLog?.activityIntensity || 'None',
      activityDurationMinutes: currentLog?.activityDurationMinutes ?? 0,
      // Stress & Mood
      emotionTag: currentLog?.emotionTag || 'Neutral',
      stressLevel: currentLog?.stressLevel ?? 3,
      // Health
      generalHealthRating: currentLog?.generalHealthRating ?? 3,
      symptoms: currentLog?.symptoms || '',
      medicationTaken: currentLog?.medicationTaken || '',
      // Environment
      weatherType: currentLog?.weatherType || 'Sunny',
      socialInteractions: currentLog?.socialInteractions || 'Neutral',
      workload: currentLog?.workload || 'Medium',
      menstrualCyclePhase: currentLog?.menstrualCyclePhase || 'None',
      // Journal & Goals
      journalNote: currentLog?.journalNote || '',
      energyGoal: currentLog?.energyGoal ?? 7,
    },
  });

  useEffect(() => {
    form.reset({
      energy: currentLog?.energy || 5,
      note: currentLog?.note || '',
      sleepHours: currentLog?.sleepHours ?? 7.0,
      sleepQuality: currentLog?.sleepQuality ?? 3,
      bedtime: currentLog?.bedtime || '',
      wakeUpTime: currentLog?.wakeUpTime || '',
      sleepNotes: currentLog?.sleepNotes || '',
      hydrationLiters: currentLog?.hydrationLiters ?? 1.5,
      mealTags: currentLog?.mealTags || '',
      caffeineIntake: currentLog?.caffeineIntake || '',
      alcoholIntake: currentLog?.alcoholIntake || '',
      sugarIntakeRating: currentLog?.sugarIntakeRating ?? 3,
      activityType: currentLog?.activityType || 'Sedentary',
      activityIntensity: currentLog?.activityIntensity || 'None',
      activityDurationMinutes: currentLog?.activityDurationMinutes ?? 0,
      emotionTag: currentLog?.emotionTag || 'Neutral',
      stressLevel: currentLog?.stressLevel ?? 3,
      generalHealthRating: currentLog?.generalHealthRating ?? 3,
      symptoms: currentLog?.symptoms || '',
      medicationTaken: currentLog?.medicationTaken || '',
      weatherType: currentLog?.weatherType || 'Sunny',
      socialInteractions: currentLog?.socialInteractions || 'Neutral',
      workload: currentLog?.workload || 'Medium',
      menstrualCyclePhase: currentLog?.menstrualCyclePhase || 'None',
      journalNote: currentLog?.journalNote || '',
      energyGoal: currentLog?.energyGoal ?? 7,
    });
  }, [selectedDate, currentLog, form]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const dataToSave: EnergyLogInput = {
        ...values,
        // Ensure optional string fields are correctly passed (empty string or undefined based on logic)
        note: values.note || undefined,
        sleepNotes: values.sleepNotes || undefined,
        mealTags: values.mealTags || undefined,
        caffeineIntake: values.caffeineIntake || undefined,
        alcoholIntake: values.alcoholIntake || undefined,
        symptoms: values.symptoms || undefined,
        medicationTaken: values.medicationTaken || undefined,
        journalNote: values.journalNote || undefined,
        
        // Nullable fields from Zod need to be handled for Firestore
        sleepHours: values.sleepHours === null ? undefined : values.sleepHours,
        sleepQuality: values.sleepQuality === null ? undefined : values.sleepQuality,
        bedtime: values.bedtime === null ? undefined : values.bedtime,
        wakeUpTime: values.wakeUpTime === null ? undefined : values.wakeUpTime,
        sugarIntakeRating: values.sugarIntakeRating === null ? undefined : values.sugarIntakeRating,
        activityType: values.activityType === null ? undefined : values.activityType,
        activityDurationMinutes: values.activityDurationMinutes === null ? undefined : values.activityDurationMinutes,
        emotionTag: values.emotionTag === null ? undefined : values.emotionTag,
        stressLevel: values.stressLevel === null ? undefined : values.stressLevel,
        generalHealthRating: values.generalHealthRating === null ? undefined : values.generalHealthRating,
        weatherType: values.weatherType === null ? undefined : values.weatherType,
        socialInteractions: values.socialInteractions === null ? undefined : values.socialInteractions,
        workload: values.workload === null ? undefined : values.workload,
        menstrualCyclePhase: values.menstrualCyclePhase === null ? undefined : values.menstrualCyclePhase,
        energyGoal: values.energyGoal === null ? undefined : values.energyGoal,

        // System managed fields
        logStreakCount: currentLog?.logStreakCount,
        rewardBadge: currentLog?.rewardBadge,
      };
      const result = await saveEnergyLogAction(dateString, dataToSave);
      if (result.success) {
        toast({
          title: 'Vibe Log Saved!',
          description: result.message,
        });
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card className="shadow-lg rounded-xl overflow-hidden">
      <CardHeader>
        <CardTitle className="font-headline">Log Vibe for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
        <CardDescription>Record your energy and other wellness factors.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Core Energy */}
            <EnergySlider
              energyLevel={form.watch('energy')}
              onEnergyChange={(energy) => form.setValue('energy', energy, { shouldValidate: true })}
            />
            {form.formState.errors.energy && (
              <p className="text-sm text-destructive">{form.formState.errors.energy.message}</p>
            )}

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quick Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any quick notes for today?" {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-4" />
            <h3 className="text-lg font-medium text-primary">Sleep</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sleepHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep (Hours)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 7.5" {...field} step="0.25"
                            onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)}
                            value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sleepQuality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sleep Quality (1-5)</FormLabel>
                     <Select onValueChange={(val) => field.onChange(val ? parseInt(val) : null)} value={field.value?.toString() ?? ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Rate sleep quality" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {sleepQualityRatings.map(r => <SelectItem key={r} value={r.toString()}>{r} - {r === 1 ? 'Poor' : r === 5 ? 'Excellent' : ''}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bedtime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedtime</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="wakeUpTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wake-up Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="sleepNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sleep Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., woke up multiple times, vivid dreams..." {...field} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />
            <h3 className="text-lg font-medium text-primary">Diet & Hydration</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hydrationLiters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hydration (Litres)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 2.0" {...field} step="0.1"
                            onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)}
                            value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sugarIntakeRating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sugar Intake Rating (1-Low, 5-High)</FormLabel>
                     <Select onValueChange={(val) => field.onChange(val ? parseInt(val) : null)} value={field.value?.toString() ?? ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Rate sugar intake" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {sugarIntakeRatings.map(r => <SelectItem key={r} value={r.toString()}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="mealTags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meals & Snacks (Tags, Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="#breakfast, #high-protein-lunch, #snack:apple" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="caffeineIntake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caffeine Intake (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 coffees, 1 black tea" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="alcoholIntake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alcohol Intake (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1 beer, none" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />
            <h3 className="text-lg font-medium text-primary">Activity</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="activityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""} >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select activity type" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {activityTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activityIntensity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Intensity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select intensity" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {activityIntensities.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activityDurationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (Mins)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 30" {...field} step="5"
                            onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)}
                            value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />
            <h3 className="text-lg font-medium text-primary">Mood & Stress</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emotionTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Emotion</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""} >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select your dominant emotion" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {emotionTags.map(tag => <SelectItem key={tag} value={tag}>{tag}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stressLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stress Level (1-Low, 5-High)</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val ? parseInt(val) : null)} value={field.value?.toString() ?? ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Rate stress level" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {stressLevelRatings.map(r => <SelectItem key={r} value={r.toString()}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Separator className="my-4" />
            <h3 className="text-lg font-medium text-primary">Health & Symptoms</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="generalHealthRating"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>General Health Rating (1-Poor, 5-Excellent)</FormLabel>
                         <Select onValueChange={(val) => field.onChange(val ? parseInt(val) : null)} value={field.value?.toString() ?? ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Rate general health" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {generalHealthRatings.map(r => <SelectItem key={r} value={r.toString()}>{r}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="symptoms"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Symptoms (Optional)</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., headache, fatigue, sore throat" {...field} value={field.value ?? ''}/>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            <FormField
                control={form.control}
                name="medicationTaken"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Medication Taken (Optional)</FormLabel>
                    <FormControl>
                    <Input placeholder="e.g., Vitamin D, Paracetamol" {...field} value={field.value ?? ''}/>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <Separator className="my-4" />
            <h3 className="text-lg font-medium text-primary">Environment & Other Factors</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="weatherType"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Weather</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select weather type" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {weatherTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="socialInteractions"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Social Interactions</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Nature of social interactions" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {socialInteractionTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="workload"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Workload</FormLabel>
                         <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Describe workload" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {workloadRatings.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="menstrualCyclePhase"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Menstrual Cycle Phase (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select phase if applicable" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {menstrualCyclePhaseTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            <Separator className="my-4" />
            <h3 className="text-lg font-medium text-primary">Goals & Reflection</h3>
             <FormField
              control={form.control}
              name="energyGoal"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Target Energy for Today</FormLabel>
                    <span className="text-sm font-semibold text-primary w-8 text-center">{field.value ?? 0}/10</span>
                  </div>
                  <FormControl>
                     <Slider
                      min={1} max={10} step={1}
                      defaultValue={[field.value ?? 7]}
                      onValueChange={(val) => field.onChange(val[0])}
                      aria-label="Energy goal"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="journalNote"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journal Note (Optional Reflection)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Deeper reflections for today..." {...field} rows={4} value={field.value ?? ''}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {currentLog?.id ? 'Update Log' : 'Save Log'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
