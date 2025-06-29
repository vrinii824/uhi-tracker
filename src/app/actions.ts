
'use server';

import { supabase } from '@/lib/supabaseClient';
import { revalidatePath } from 'next/cache';
import type { PostgrestError } from '@supabase/supabase-js';

// Keep existing type definitions
export type EmotionTag = 
  | "Happy" | "Content" | "Grateful" | "Excited" | "Optimistic" // Positive
  | "Neutral" | "Okay" // Neutral
  | "Calm" | "Relaxed" | "Peaceful" // Calm
  | "Stressed" | "Anxious" | "Overwhelmed" | "Worried" // Stressed/Anxious
  | "Sad" | "Disappointed" | "Lonely" | "Grieving" // Sad
  | "Energetic" | "Productive" | "Focused" // Energetic/Productive
  | "Motivated" | "Inspired" // Motivated
  | "Tired" | "Fatigued" | "Exhausted" // Tired
  | "Irritable" | "Frustrated" | "Angry" // Irritable/Angry
  | "Other";

export type WeatherType = "Sunny" | "Cloudy" | "Rainy" | "Snowy" | "Windy" | "Foggy" | "Stormy" | "Other";
export type ActivityIntensity = "Low" | "Medium" | "High" | "None";

export type SleepQualityRating = 1 | 2 | 3 | 4 | 5; 
export type StressLevelRating = 1 | 2 | 3 | 4 | 5; 
export type GeneralHealthRating = 1 | 2 | 3 | 4 | 5; 
export type SugarIntakeRating = 1 | 2 | 3 | 4 | 5; 
export type WorkloadRating = "Low" | "Medium" | "High" | "Overloaded";
export type SocialInteractionType = "Positive" | "Neutral" | "Negative" | "Draining" | "None";
export type MenstrualCyclePhaseType = "Menstruation" | "Follicular" | "Ovulation" | "Luteal" | "None" | "Unknown";
export type ActivityType = 
  | "Gym" | "Running" | "Walking" | "Cycling" | "Swimming" | "Yoga" | "Pilates" 
  | "Sports" | "Strength Training" | "HIIT" | "Dance" | "Hiking" | "Housework" 
  | "Gardening" | "Stretching" | "Rest Day" | "Sedentary" | "Other";

// Input type for the form/action
export interface EnergyLogInput {
  energy: number; 
  note?: string; 
  
  sleepHours?: number; 
  sleepQuality?: SleepQualityRating; 
  bedtime?: string; 
  wakeUpTime?: string; 
  sleepNotes?: string;

  hydrationLiters: number; 
  mealTags?: string; 
  caffeineIntake?: string; 
  alcoholIntake?: string; 
  sugarIntakeRating?: SugarIntakeRating;

  activityType?: ActivityType;
  activityIntensity: ActivityIntensity; 
  activityDurationMinutes?: number; 

  emotionTag?: EmotionTag;
  stressLevel?: StressLevelRating; 

  generalHealthRating?: GeneralHealthRating; 
  symptoms?: string; 
  medicationTaken?: string;

  weatherType?: WeatherType;
  socialInteractions?: SocialInteractionType;
  workload?: WorkloadRating;
  menstrualCyclePhase?: MenstrualCyclePhaseType;

  journalNote?: string;
  energyGoal?: number; 
  logStreakCount?: number; 
  rewardBadge?: string;
}

// Interface for data structure used in the frontend and returned by actions
export interface EnergyLog extends EnergyLogInput {
  id: string; // Supabase primary key (UUID)
  date: Date; // Represents the log_date, ensures it's a Date object
}

const USER_ID = 'user_001'; // Placeholder for user authentication

// Helper function to map Supabase row to EnergyLog interface
function mapSupabaseRowToEnergyLog(row: any): EnergyLog {
  return {
    id: row.id,
    date: new Date(row.log_date + 'T00:00:00Z'), // Ensures UTC date parsing
    energy: row.energy_level,
    note: row.quick_note || undefined,
    
    sleepHours: row.sleep_hours === null ? undefined : Number(row.sleep_hours),
    sleepQuality: row.sleep_quality === null ? undefined : row.sleep_quality as SleepQualityRating | undefined,
    bedtime: row.bedtime || undefined,
    wakeUpTime: row.wake_up_time || undefined,
    sleepNotes: row.sleep_notes || undefined,

    hydrationLiters: Number(row.hydration_liters),
    mealTags: row.meal_tags || undefined,
    caffeineIntake: row.caffeine_intake || undefined,
    alcoholIntake: row.alcohol_intake || undefined,
    sugarIntakeRating: row.sugar_intake_rating === null ? undefined : row.sugar_intake_rating as SugarIntakeRating | undefined,

    activityType: row.activity_type as ActivityType || undefined,
    activityIntensity: row.activity_intensity as ActivityIntensity,
    activityDurationMinutes: row.activity_duration_minutes === null ? undefined : Number(row.activity_duration_minutes),

    emotionTag: row.emotion_tag as EmotionTag || undefined,
    stressLevel: row.stress_level === null ? undefined : row.stress_level as StressLevelRating | undefined,

    generalHealthRating: row.general_health_rating === null ? undefined : row.general_health_rating as GeneralHealthRating | undefined,
    symptoms: row.symptoms || undefined,
    medicationTaken: row.medication_taken || undefined,

    weatherType: row.weather_type as WeatherType || undefined,
    socialInteractions: row.social_interactions as SocialInteractionType || undefined,
    workload: row.workload as WorkloadRating || undefined,
    menstrualCyclePhase: row.menstrual_cycle_phase as MenstrualCyclePhaseType || undefined,

    journalNote: row.journal_note || undefined,
    energyGoal: row.energy_goal === null ? undefined : Number(row.energy_goal),
    logStreakCount: row.log_streak_count === null ? undefined : Number(row.log_streak_count),
    rewardBadge: row.reward_badge || undefined,
  };
}

export async function saveEnergyLogAction(dateString: string, data: EnergyLogInput): Promise<{ success: boolean; message: string; error?: PostgrestError | null }> {
  if (data.energy < 1 || data.energy > 10) {
    return { success: false, message: 'Invalid energy level. It must be between 1 and 10.' };
  }

  const logDataForSupabase = {
    user_identifier: USER_ID,
    log_date: dateString, // YYYY-MM-DD format

    energy_level: data.energy,
    quick_note: data.note || null,

    sleep_hours: data.sleepHours ?? null,
    sleep_quality: data.sleepQuality ?? null,
    bedtime: data.bedtime || null,
    wake_up_time: data.wakeUpTime || null,
    sleep_notes: data.sleepNotes || null,

    hydration_liters: data.hydrationLiters, // This is required
    meal_tags: data.mealTags || null,
    caffeine_intake: data.caffeineIntake || null,
    alcohol_intake: data.alcoholIntake || null,
    sugar_intake_rating: data.sugarIntakeRating ?? null,

    activity_type: data.activityType || null,
    activity_intensity: data.activityIntensity, // This is required
    activity_duration_minutes: data.activityDurationMinutes ?? null,

    emotion_tag: data.emotionTag || null,
    stress_level: data.stressLevel ?? null,

    general_health_rating: data.generalHealthRating ?? null,
    symptoms: data.symptoms || null,
    medication_taken: data.medicationTaken || null,

    weather_type: data.weatherType || null,
    social_interactions: data.socialInteractions || null,
    workload: data.workload || null,
    menstrual_cycle_phase: data.menstrualCyclePhase || null,

    journal_note: data.journalNote || null,
    energy_goal: data.energyGoal ?? null,
    log_streak_count: data.logStreakCount ?? null, // System managed, frontend might pass current value
    reward_badge: data.rewardBadge || null, // System managed
    // created_at and updated_at are handled by Supabase defaults/triggers
  };

  try {
    const { error } = await supabase
      .from('energy_logs')
      .upsert(logDataForSupabase, { onConflict: 'user_identifier, log_date' });

    if (error) {
      console.error('Supabase upsert error:', error);
      return { success: false, message: `Failed to save E-Track log: ${error.message}`, error };
    }

    revalidatePath('/'); // Revalidate the cache for the home page
    revalidatePath(`/log/${dateString}`); // If you have a specific log page by date
    return { success: true, message: 'E-Track log saved successfully!' };
  } catch (e: any) {
    console.error('Error in saveEnergyLogAction:', e);
    return { success: false, message: `An unexpected error occurred: ${e.message}` };
  }
}

export async function getEnergyLogAction(dateString: string): Promise<EnergyLog | null> {
  try {
    const { data, error } = await supabase
      .from('energy_logs')
      .select('*')
      .eq('user_identifier', USER_ID)
      .eq('log_date', dateString)
      .maybeSingle();

    if (error) {
      console.error('Supabase select error (getEnergyLogAction):', error);
      // PGRST116 means "Resource Not Found" (0 rows), which is not an error in maybeSingle() context
      if (error.code !== 'PGRST116') {
         throw error;
      }
    }

    if (data) {
      return mapSupabaseRowToEnergyLog(data);
    }
    return null;
  } catch (e: any) {
    console.error('Error fetching energy log:', e);
    return null;
  }
}

export async function getRecentEnergyLogsAction(count: number = 7): Promise<EnergyLog[]> {
  try {
    const { data, error } = await supabase
      .from('energy_logs')
      .select('*')
      .eq('user_identifier', USER_ID)
      .order('log_date', { ascending: false })
      .limit(count);

    if (error) {
      console.error('Supabase select error (getRecentEnergyLogsAction):', error);
      throw error;
    }

    if (data) {
      return data.map(mapSupabaseRowToEnergyLog);
    }
    return [];
  } catch (e: any) {
    console.error('Error fetching recent energy logs:', e);
    return [];
  }
}
