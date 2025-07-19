import React, { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ArrowLeft, BarChart3, Eye } from 'lucide-react';
import { ChartData, ChartConfig } from '../App';

interface DataPreviewProps {
  data: any[];
  onDataProcess: (chartData: ChartData, config: ChartConfig) => void;
  onBack: () => void;
}

export function DataPreview({ data, onDataProcess, onBack }: DataPreviewProps) {
  const [selectedXColumn, setSelectedXColumn] = useState<string>('');
  const [selectedYColumn, setSelectedYColumn] = useState<string>('');

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  }, [data]);

  const numericColumns = useMemo(() => {
    if (data.length === 0) return [];
    return columns.filter(col => {
      return data.some(row => {
        const value = row[col];
        return !isNaN(parseFloat(value)) && isFinite(value);
      });
    });
  }, [columns, data]);

  const stringColumns = useMemo(() => {
    if (data.length === 0) return [];
    return columns.filter(col => !numericColumns.includes(col));
  }, [columns, data.length, numericColumns]);

  const canGenerateChart = selectedXColumn && selectedYColumn;

  const generateChart = () => {
    if (!canGenerateChart) return;

    const chartData: ChartData = {
      labels: data.map(row => String(row[selectedXColumn])),
      values: data.map(row => parseFloat(row[selectedYColumn]) || 0)
    };

    const config: ChartConfig = {
      xColumn: selectedXColumn,
      yColumn: selectedYColumn,
      colorScheme: 'blue',
      showGrid: true,
      chartHeight: 10
    };

    onDataProcess(chartData, config);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Configure Your Chart</h2>
          <p className="text-muted-foreground">
            Select the columns to use for your 3D bar chart
          </p>
        </div>
        <Button variant="outline" onClick={onBack} className="space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Upload</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Chart Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  X-Axis (Categories)
                </label>
                <Select value={selectedXColumn} onValueChange={setSelectedXColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category column" />
                  </SelectTrigger>
                  <SelectContent>
                    {stringColumns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                    {numericColumns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Y-Axis (Values)
                </label>
                <Select value={selectedYColumn} onValueChange={setSelectedYColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select value column" />
                  </SelectTrigger>
                  <SelectContent>
                    {numericColumns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={generateChart} 
              disabled={!canGenerateChart}
              className="w-full space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Generate 3D Chart</span>
            </Button>
          </div>
        </Card>

        {/* Data Preview */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Data Preview</h3>
            <span className="text-sm text-muted-foreground">
              ({data.length} rows)
            </span>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map(col => (
                      <TableHead 
                        key={col} 
                        className={`font-medium ${
                          col === selectedXColumn ? 'bg-primary/10 text-primary' :
                          col === selectedYColumn ? 'bg-accent/10 text-accent' : ''
                        }`}
                      >
                        {col}
                        {numericColumns.includes(col) && (
                          <span className="ml-1 text-xs text-muted-foreground">(num)</span>
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      {columns.map(col => (
                        <TableCell 
                          key={col}
                          className={`${
                            col === selectedXColumn ? 'bg-primary/5' :
                            col === selectedYColumn ? 'bg-accent/5' : ''
                          }`}
                        >
                          {String(row[col])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {data.length > 10 && (
              <div className="p-3 bg-muted/50 text-center text-sm text-muted-foreground">
                Showing first 10 rows of {data.length} total rows
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}