'use client';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface EnergySliderProps {
  energyLevel: number;
  onEnergyChange: (level: number) => void;
}

export function EnergySlider({ energyLevel, onEnergyChange }: EnergySliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <Label htmlFor="energy-slider" className="text-sm font-medium text-foreground">
          Energy Level:
        </Label>
        <span className="text-sm font-semibold text-primary w-8 text-center">{energyLevel}</span>
      </div>
      <Slider
        id="energy-slider"
        min={1}
        max={10}
        step={1}
        value={[energyLevel]}
        onValueChange={(value) => onEnergyChange(value[0])}
        className="w-full"
        aria-label={`Energy level ${energyLevel} out of 10`}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
}
