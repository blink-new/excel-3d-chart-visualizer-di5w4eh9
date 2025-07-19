import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface FileUploadProps {
  onFileUpload: (data: any[]) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Get the first worksheet
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      
      // Convert to JSON with proper header handling
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        throw new Error('The file appears to be empty');
      }

      console.log('Raw JSON data:', jsonData);

      // Get headers from first row, ensuring we handle all columns
      const firstRow = jsonData[0] as any[];
      const headers = firstRow.map((header, index) => {
        // If header is empty or undefined, create a default column name
        if (header === undefined || header === null || header === '') {
          return `Column_${index + 1}`;
        }
        return String(header).trim();
      });

      console.log('Processed headers:', headers);

      // Get data rows (skip first row which contains headers)
      const rows = jsonData.slice(1) as any[][];
      
      // Convert rows to objects, ensuring all columns are included
      const data = rows
        .filter(row => row && row.some(cell => cell !== undefined && cell !== null && cell !== ''))
        .map((row, rowIndex) => {
          const obj: any = {};
          // Process each column, even if the row is shorter than headers
          headers.forEach((header, colIndex) => {
            const cellValue = row[colIndex];
            // Preserve the original value, including 0, false, etc.
            obj[header] = cellValue !== undefined && cellValue !== null ? cellValue : '';
          });
          return obj;
        });

      if (data.length === 0) {
        throw new Error('No valid data rows found in the file');
      }

      setSuccess(`Successfully loaded ${data.length} rows of data`);
      onFileUpload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileUpload]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: isProcessing
  });

  const loadSampleData = () => {
    const sampleData = [
      { Product: 'Laptops', Q1: 120, Q2: 135, Q3: 148, Q4: 162 },
      { Product: 'Smartphones', Q1: 200, Q2: 220, Q3: 195, Q4: 240 },
      { Product: 'Tablets', Q1: 80, Q2: 75, Q3: 90, Q4: 85 },
      { Product: 'Headphones', Q1: 150, Q2: 165, Q3: 180, Q4: 175 },
      { Product: 'Smartwatches', Q1: 60, Q2: 70, Q3: 85, Q4: 95 },
      { Product: 'Cameras', Q1: 45, Q2: 50, Q3: 55, Q4: 48 }
    ];
    
    console.log('Loading sample data:', sampleData);
    setSuccess('Sample data loaded successfully');
    onFileUpload(sampleData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Upload Your Excel Data</h2>
        <p className="text-muted-foreground">
          Drag and drop your Excel file or click to browse. Supports .xlsx, .xls, and .csv files.
        </p>
      </div>

      <Card className="p-8">
        <div
          {...getRootProps()}
          className={`upload-zone border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
            isDragActive ? 'drag-active' : 'border-border hover:border-primary/50'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {isProcessing ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              ) : (
                <Upload className="h-8 w-8 text-primary" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium text-foreground">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your Excel file here'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse your files
              </p>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <FileSpreadsheet className="h-4 w-4" />
                <span>.xlsx</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileSpreadsheet className="h-4 w-4" />
                <span>.xls</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileSpreadsheet className="h-4 w-4" />
                <span>.csv</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Don't have data ready? Try our sample dataset
        </p>
        <Button 
          variant="outline" 
          onClick={loadSampleData}
          disabled={isProcessing}
          className="space-x-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Load Sample Data</span>
        </Button>
      </div>
    </div>
  );
}