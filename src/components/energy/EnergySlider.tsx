
'use client';

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { cn } from "@/lib/utils"
import { Label } from '@/components/ui/label';

interface EnergySliderProps {
  energyLevel: number;
  onEnergyChange: (level: number) => void;
}

export function EnergySlider({ energyLevel, onEnergyChange }: EnergySliderProps) {
  const getEnergyColorClasses = (level: number) => {
    if (level <= 3) {
      return {
        range: "bg-red-500",
        thumbBorder: "border-red-500",
        text: "text-red-600",
      };
    } else if (level <= 7) {
      return {
        range: "bg-yellow-500",
        thumbBorder: "border-yellow-500",
        text: "text-yellow-600",
      };
    } else {
      return {
        range: "bg-green-500",
        thumbBorder: "border-green-500",
        text: "text-green-600",
      };
    }
  };

  const colorClasses = getEnergyColorClasses(energyLevel);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label htmlFor="energy-slider" className="text-sm font-medium text-foreground">
          Energy Level:
        </Label>
        <span className={cn("text-sm font-semibold w-8 text-center", colorClasses.text)}>{energyLevel}</span>
      </div>
      <SliderPrimitive.Root
        id="energy-slider"
        min={1}
        max={10}
        step={1}
        value={[energyLevel]}
        onValueChange={(value) => onEnergyChange(value[0])}
        className={cn("relative flex w-full touch-none select-none items-center")}
        aria-label={`Energy level ${energyLevel} out of 10`}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className={cn("absolute h-full", colorClasses.range)} />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb 
          className={cn(
            "block h-5 w-5 rounded-full border-2 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            colorClasses.thumbBorder
          )} 
        />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}
