import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { DataPreview } from './components/DataPreview';
import { Chart3D } from './components/Chart3D';
import { ChartControls } from './components/ChartControls';
import { Card } from './components/ui/card';
import { BarChart3, Upload, Settings, Download } from 'lucide-react';

export interface ChartData {
  labels: string[];
  values: number[];
  categories?: string[];
}

export interface ChartConfig {
  xColumn: string;
  yColumn: string;
  colorScheme: string;
  showGrid: boolean;
  chartHeight: number;
}

function App() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    xColumn: '',
    yColumn: '',
    colorScheme: 'blue',
    showGrid: true,
    chartHeight: 10
  });
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'chart'>('upload');

  const handleFileUpload = (data: any[]) => {
    setRawData(data);
    setCurrentStep('preview');
  };

  const handleDataProcess = (processedData: ChartData, config: ChartConfig) => {
    setChartData(processedData);
    setChartConfig(config);
    setCurrentStep('chart');
  };

  const handleBackToUpload = () => {
    setRawData([]);
    setChartData(null);
    setCurrentStep('upload');
  };

  const handleBackToPreview = () => {
    setChartData(null);
    setCurrentStep('preview');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Excel to 3D Chart Visualizer</h1>
                <p className="text-sm text-muted-foreground">Transform your data into interactive 3D visualizations</p>
              </div>
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                currentStep === 'upload' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                currentStep === 'preview' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <Settings className="h-4 w-4" />
                <span>Configure</span>
              </div>
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                currentStep === 'chart' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                <BarChart3 className="h-4 w-4" />
                <span>Visualize</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentStep === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        )}

        {currentStep === 'preview' && rawData.length > 0 && (
          <div className="space-y-6">
            <DataPreview 
              data={rawData} 
              onDataProcess={handleDataProcess}
              onBack={handleBackToUpload}
            />
          </div>
        )}

        {currentStep === 'chart' && chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="p-6">
                <Chart3D 
                  data={chartData} 
                  config={chartConfig}
                />
              </Card>
            </div>
            <div className="space-y-4">
              <ChartControls 
                config={chartConfig}
                onConfigChange={setChartConfig}
                onBack={handleBackToPreview}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;