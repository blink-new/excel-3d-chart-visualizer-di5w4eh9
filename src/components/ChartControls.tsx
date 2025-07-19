import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { ArrowLeft, Palette, Settings } from 'lucide-react';
import { ChartConfig } from '../App';

interface ChartControlsProps {
  config: ChartConfig;
  onConfigChange: (config: ChartConfig) => void;
  onBack: () => void;
}

export function ChartControls({ config, onConfigChange, onBack }: ChartControlsProps) {
  const colorSchemes = [
    { value: 'blue', label: 'Blue', colors: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'] },
    { value: 'green', label: 'Green', colors: ['#10B981', '#059669', '#047857', '#065F46'] },
    { value: 'purple', label: 'Purple', colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'] },
    { value: 'orange', label: 'Orange', colors: ['#F59E0B', '#D97706', '#B45309', '#92400E'] },
    { value: 'red', label: 'Red', colors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'] }
  ];

  const updateConfig = (updates: Partial<ChartConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Chart Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Color Scheme</Label>
            <Select value={config.colorScheme} onValueChange={(value) => updateConfig({ colorScheme: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorSchemes.map(scheme => (
                  <SelectItem key={scheme.value} value={scheme.value}>
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {scheme.colors.map((color, index) => (
                          <div
                            key={index}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span>{scheme.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Chart Height: {config.chartHeight}
            </Label>
            <Slider
              value={[config.chartHeight]}
              onValueChange={(value) => updateConfig({ chartHeight: value[0] })}
              min={5}
              max={20}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-grid" className="text-sm font-medium">
              Show Grid
            </Label>
            <Switch
              id="show-grid"
              checked={config.showGrid}
              onCheckedChange={(checked) => updateConfig({ showGrid: checked })}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Data Info</h3>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">X-Axis:</span>
            <span className="font-medium">{config.xColumn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Y-Axis:</span>
            <span className="font-medium">{config.yColumn}</span>
          </div>
        </div>
      </Card>

      <Button variant="outline" onClick={onBack} className="w-full space-x-2">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Configuration</span>
      </Button>
    </div>
  );
}