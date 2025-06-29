
'use server';
/**
 * @fileOverview Provides an AI-driven analysis of energy logs.
 *
 * - getAIAnalysis - A function that takes recent full energy logs and returns an analysis.
 * - AnalyzeEnergyOutput - The Typescript type for the return type of the getAIAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { EnergyLog } from '@/app/actions'; // Import the full type
import { format } from 'date-fns';

// Simplified log structure for AI analysis to keep prompts clean and focused
const SimplifiedEnergyLogSchema = z.object({
  date: z.string().describe("Date of the log, e.g., 'MMM d'"),
  energyLevel: z.number().describe("Energy level from 1 to 10"),
  emotionTag: z.string().optional().describe("Primary emotion reported, if any"),
  sleepHours: z.number().optional().describe("Hours of sleep, if available"),
  stressLevel: z.number().optional().describe("Stress level from 1 to 5, if available"),
  activityType: z.string().optional().describe("Type of activity performed, if any"),
  activityIntensity: z.string().optional().describe("Intensity of the activity, if any"),
  quickNote: z.string().optional().describe("A brief note for the day, if any"),
});
type SimplifiedEnergyLog = z.infer<typeof SimplifiedEnergyLogSchema>;

// This input schema is for the Genkit prompt, not directly for the exported server action
const AnalyzeEnergyInputSchemaInternal = z.object({
  logs: z.array(SimplifiedEnergyLogSchema).min(1).max(14) // Analyze up to 14 recent logs
    .describe("An array of recent simplified energy logs, typically 3-7. Should be in chronological order (oldest to newest if possible).")
});
// This type is internal to the flow
// type AnalyzeEnergyInputInternal = z.infer<typeof AnalyzeEnergyInputSchemaInternal>;


const AnalyzeEnergyOutputSchemaInternal = z.object({
  analysis: z.string().describe("A textual analysis of the energy logs. It should identify patterns, potential correlations between energy levels and other factors (like sleep, stress, activity), and offer 1-2 general, non-medical wellness insights or gentle suggestions. The tone should be supportive and helpful. If data is too sparse (e.g., less than 3 logs or minimal details), it should state that more data would be beneficial for a deeper analysis. Use markdown for light formatting like bullet points if it enhances readability."),
});
export type AnalyzeEnergyOutput = z.infer<typeof AnalyzeEnergyOutputSchemaInternal>;

// Internal helper to convert full EnergyLog to SimplifiedEnergyLog
// NOT EXPORTED
function convertToSimplifiedLogs(fullLogs: EnergyLog[]): SimplifiedEnergyLog[] {
  return fullLogs.map(log => ({
    date: format(log.date, 'MMM d'), // log.date is already a Date object
    energyLevel: log.energy,
    emotionTag: log.emotionTag,
    sleepHours: log.sleepHours,
    stressLevel: log.stressLevel,
    activityType: log.activityType,
    activityIntensity: log.activityIntensity,
    quickNote: log.note,
  }));
}

const analysisPrompt = ai.definePrompt({
  name: 'analyzeEnergyPrompt',
  input: {schema: AnalyzeEnergyInputSchemaInternal}, 
  output: {schema: AnalyzeEnergyOutputSchemaInternal},
  prompt: `You are Vibe Vault's friendly and insightful AI wellness assistant.
Your goal is to analyze the provided energy log data for a user.
Based on the logs, provide a brief analysis. Your analysis should:
1.  Identify any noticeable patterns or trends in energy levels.
2.  Explore potential correlations: For example, does energy seem higher after more sleep? Does stress impact energy? Does activity type/intensity correlate with energy?
3.  Offer 1-2 general wellness insights or gentle, actionable suggestions. These should be positive and encouraging. **Do NOT provide medical advice.**
4.  Keep the analysis concise, ideally 3-5 sentences or a few bullet points.
5.  If the provided data is very sparse (e.g., less than 3 logs or logs with very few details filled in), kindly state that more comprehensive data would help in providing a richer analysis, but still try to offer a small observation if possible.
6.  Format your response clearly. You can use markdown for bullet points if it makes sense.

Here are the recent energy logs:
{{#each logs}}
- **{{this.date}}**:
  - Energy: {{this.energyLevel}}/10
  {{#if this.emotionTag}}- Emotion: {{this.emotionTag}}{{/if}}
  {{#if this.sleepHours}}- Sleep: {{this.sleepHours}} hours{{/if}}
  {{#if this.stressLevel}}- Stress: {{this.stressLevel}}/5{{/if}}
  {{#if this.activityType}}- Activity: {{this.activityType}} ({{this.activityIntensity}}){{/if}}
  {{#if this.quickNote}}- Note: "{{this.quickNote}}"{{/if}}
{{else}}
No logs provided for analysis.
{{/each}}

Please provide your analysis based on these logs.
`,
  config: {
    temperature: 0.5, // Slightly more creative but still factual
  }
});

const analyzeEnergyFlow = ai.defineFlow(
  {
    name: 'analyzeEnergyFlow',
    inputSchema: AnalyzeEnergyInputSchemaInternal, 
    outputSchema: AnalyzeEnergyOutputSchemaInternal,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    if (!output) {
      return { analysis: "I couldn't generate an analysis at this time. Please try again later." };
    }
    return output;
  }
);

// Exported Server Action
export async function getAIAnalysis(fullLogs: EnergyLog[]): Promise<AnalyzeEnergyOutput> {
  if (!fullLogs || fullLogs.length === 0) {
    return { analysis: "No logs were provided for analysis. Please log some entries first." };
  }

  const simplifiedLogs = convertToSimplifiedLogs(fullLogs);

  if (simplifiedLogs.length < 2) { 
     return { analysis: "I need at least a couple of entries to spot any trends. Keep logging your vibes!" };
  }
  
  // Pass the simplified logs to the internal Genkit flow
  return analyzeEnergyFlow({ logs: simplifiedLogs });
}
