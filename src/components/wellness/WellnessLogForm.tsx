'use client';

import { useState, useEffect, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { EnergySlider } from './EnergySlider';
import { saveEnergyLogAction, EnergyLog, EnergyLogInput } from '@/app/actions'; // Updated actions and types
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  energy: z.number().min(1, {message: 'Energy level must be at least 1.'}).max(10, {message: 'Energy level must be at most 10.'}),
});

interface EnergyLogFormProps { // Renamed props interface
  selectedDate: Date;
  currentLog: EnergyLog | null; // Updated type
}

export function EnergyLogForm({ selectedDate, currentLog }: EnergyLogFormProps) { // Renamed component and props
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      energy: currentLog?.energy || 5,
    },
  });

  useEffect(() => {
    form.reset({
      energy: currentLog?.energy || 5,
    });
  }, [selectedDate, currentLog, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const result = await saveEnergyLogAction(dateString, values as EnergyLogInput); // Updated action
      if (result.success) {
        toast({
          title: 'Energy Log Saved!',
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
        <CardTitle className="font-headline">Log Energy for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
        <CardDescription>How is your energy level today?</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <EnergySlider
              energyLevel={form.watch('energy')}
              onEnergyChange={(energy) => form.setValue('energy', energy, { shouldValidate: true })}
            />
            {form.formState.errors.energy && (
              <p className="text-sm text-destructive">{form.formState.errors.energy.message}</p>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {currentLog ? 'Update Energy Log' : 'Save Energy Log'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
