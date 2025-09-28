import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UploadCloud, FileUp, CheckCircle2, AlertTriangle, X, Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';

const SOURCES = [
  { key: 'maximo', label: 'IBM Maximo' },
  { key: 'iot', label: 'IoT Fitness Sensors' },
  { key: 'uns', label: 'UNS Data Streams' },
  { key: 'manual', label: 'Manual Overrides' },
  { key: 'spreadsheets', label: 'Spreadsheets' },
  { key: 'other', label: 'Other Uploads' },
] as const;

interface UploadResult {
  status: 'ok' | 'error';
  rows_ingested: number;
  warnings: string[];
  errors: Array<{ row: number; message: string }>; 
  preview?: Array<Record<string, any>>;
}

export const DataUpload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedSource, setSelectedSource] = useState<typeof SOURCES[number]['key']>('maximo');
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<Record<string, UploadResult | null>>({});
  const [activeTab, setActiveTab] = useState<'preview' | 'validation' | 'merge'>('preview');
  const inputRef = useRef<HTMLInputElement>(null);

  // Canonical field suggestions per source (can grow over time)
  const canonicalFields: Record<typeof SOURCES[number]['key'], string[]> = {
    maximo: ['asset_id', 'train_id', 'job_id', 'job_type', 'status', 'start_date', 'end_date', 'technician', 'cost', 'depot'],
    iot: ['train_id', 'timestamp', 'sensor_type', 'value', 'unit', 'status'],
    uns: ['stream_id', 'train_id', 'topic', 'payload_ts', 'key', 'value', 'quality'],
    manual: ['train_id', 'field', 'value', 'reason', 'operator', 'effective_from'],
    spreadsheets: ['train_id', 'mileage_km', 'last_maintenance', 'maintenance_flag', 'fitness_score', 'depot', 'branding_campaign'],
    other: ['file_name', 'source_system', 'uploaded_by', 'uploaded_at', 'notes'],
  };
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});

  const ingestMutation = useMutation({
    mutationFn: async ({ source, file }: { source: string; file: File }) => {
      return api.ingestUpload(source, file);
    },
  });

  const onDropFiles = useCallback((newFiles: FileList | File[]) => {
    const asArray = Array.from(newFiles);
    const onlyCsv = asArray.filter((f) => f.type === 'text/csv' || f.name.toLowerCase().endsWith('.csv'));
    if (onlyCsv.length !== asArray.length) {
      toast.error('Only CSV files are supported');
    }
    setFiles((prev) => [...prev, ...onlyCsv]);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onDropFiles(e.target.files);
  }, [onDropFiles]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDropFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const removeFile = (name: string) => setFiles((prev) => prev.filter((f) => f.name !== name));

  const uploadAll = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one CSV file');
      return;
    }
    const newResults: Record<string, UploadResult | null> = {};
    for (const file of files) {
      try {
        const res = await ingestMutation.mutateAsync({ source: selectedSource, file });
        newResults[file.name] = res as UploadResult;
        toast.success(`Uploaded ${file.name}`);
      } catch (err: any) {
        newResults[file.name] = {
          status: 'error',
          rows_ingested: 0,
          warnings: [],
          errors: [{ row: -1, message: err?.message || 'Upload failed' }],
        };
        toast.error(`Failed ${file.name}`);
      }
    }
    setResults((prev) => ({ ...prev, ...newResults }));
  };

  // Derived data for preview/validation tables
  const combinedPreview = useMemo(() => {
    // Take first available preview for display
    for (const f of files) {
      const res = results[f.name];
      if (res?.preview && res.preview.length > 0) return res.preview;
    }
    return [] as Array<Record<string, any>>;
  }, [files, results]);

  const aggregatedWarnings = useMemo(() => {
    const all: Array<{ file: string; message: string }> = [];
    for (const [name, res] of Object.entries(results)) {
      if (res?.warnings?.length) {
        res.warnings.forEach((w) => all.push({ file: name, message: w }));
      }
    }
    return all;
  }, [results]);

  const aggregatedErrors = useMemo(() => {
    const all: Array<{ file: string; row: number; message: string }> = [];
    for (const [name, res] of Object.entries(results)) {
      if (res?.errors?.length) {
        res.errors.forEach((er) => all.push({ file: name, row: er.row, message: er.message }));
      }
    }
    return all;
  }, [results]);

  // Infer simple column types from combinedPreview (string | number | date)
  const inferredTypes = useMemo(() => {
    const types: Record<string, string> = {};
    const rows = combinedPreview.slice(0, 100);
    const keys = Object.keys(combinedPreview[0] || {});
    keys.forEach((k) => {
      let num = 0;
      let date = 0;
      let total = 0;
      rows.forEach((r) => {
        const v = r[k];
        if (v === null || v === undefined || v === '') return;
        total++;
        const s = String(v).trim();
        if (!Number.isNaN(Number(s)) && s !== '') num++;
        if (!isNaN(Date.parse(s))) date++;
      });
      if (total === 0) {
        types[k] = 'string';
      } else if (date / total > 0.6) {
        types[k] = 'date';
      } else if (num / total > 0.6) {
        types[k] = 'number';
      } else {
        types[k] = 'string';
      }
    });
    return types;
  }, [combinedPreview]);

  const updateMapping = (sourceCol: string, canonical: string) => {
    setColumnMapping((prev) => ({ ...prev, [sourceCol]: canonical }));
  };

  const exportValidation = () => {
    const payload = {
      source: selectedSource,
      files: Object.keys(results),
      mapping: columnMapping,
      warnings: aggregatedWarnings,
      errors: aggregatedErrors,
      preview: combinedPreview.slice(0, 50),
      generated_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation_${selectedSource}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Data Upload</h1>
            <p className="text-gray-400 mt-1">Upload and validate operational datasets in CSV format</p>
          </div>
          <div className="flex gap-3">
            <select
              className="input w-56 h-10"
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as any)}
            >
              {SOURCES.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <Button onClick={uploadAll} disabled={files.length === 0 || ingestMutation.isPending}>
              {ingestMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UploadCloud className="h-4 w-4 mr-2" />}
              Upload All
            </Button>
            {Object.keys(results).length > 0 && (
              <Button variant="secondary" onClick={exportValidation}>
                <Download className="h-4 w-4 mr-2" /> Export Validation
              </Button>
            )}
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <Card>
          <CardHeader>
            <CardTitle>File Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-white'}`}
            >
              <input ref={inputRef} type="file" accept=".csv,text/csv" multiple className="hidden" onChange={handleFileInput} />
              <FileUp className="h-10 w-10 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-300 mb-2">Drag and drop CSV files here, or</p>
              <Button variant="secondary" onClick={() => inputRef.current?.click()}>Browse Files</Button>
              <p className="text-xs text-gray-500 mt-2">Only .csv files are supported</p>
            </div>
          </CardContent>
        </Card>

        {/* Selected Files */}
        {files.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Selected Files ({files.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.map((f) => (
                  <div key={f.name} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <FileUp className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{f.name}</div>
                        <div className="text-xs text-gray-600">{(f.size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {results[f.name]?.status === 'ok' && (
                        <span className="inline-flex items-center text-success-400 text-sm">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Uploaded
                        </span>
                      )}
                      {results[f.name]?.status === 'error' && (
                        <span className="inline-flex items-center text-danger-400 text-sm">
                          <AlertTriangle className="h-4 w-4 mr-1" /> Failed
                        </span>
                      )}
                      <button className="text-gray-500 hover:text-gray-700" onClick={() => removeFile(f.name)}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview / Validation / Merge workspace */}
        {Object.keys(results).length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Review</CardTitle>
                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-md border border-gray-200">
                  <button
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'preview' ? 'bg-white text-gray-900 border border-gray-200' : 'text-gray-700 hover:text-gray-900'}`}
                    onClick={() => setActiveTab('preview')}
                  >Preview</button>
                  <button
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'validation' ? 'bg-white text-gray-900 border border-gray-200' : 'text-gray-700 hover:text-gray-900'}`}
                    onClick={() => setActiveTab('validation')}
                  >Validation</button>
                  <button
                    className={`px-3 py-1 text-sm rounded ${activeTab === 'merge' ? 'bg-white text-gray-900 border border-gray-200' : 'text-gray-700 hover:text-gray-900'}`}
                    onClick={() => setActiveTab('merge')}
                  >Merge</button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'preview' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Combined preview table */}
                  <div className="overflow-auto border border-gray-200 rounded-lg">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          {Object.keys(combinedPreview[0] || {}).map((k) => (
                            <th key={k} className="px-3 py-2 text-left font-medium text-gray-300 border-b border-surface-700">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-700">{k}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">{inferredTypes[k] || 'string'}</span>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {combinedPreview.slice(0, 50).map((row, idx) => (
                          <tr key={idx} className="odd:bg-white even:bg-gray-50">
                            {Object.keys(combinedPreview[0] || {}).map((k) => (
                              <td key={k} className="px-3 py-2 text-gray-800 border-b border-gray-100">{String(row[k])}</td>
                            ))}
                          </tr>
                        ))}
                        {combinedPreview.length === 0 && (
                          <tr>
                            <td className="px-3 py-4 text-gray-500">No preview available. Upload files to view a sample.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mapping editor and Per-file quick summary */}
                  <div className="space-y-3">
                    {/* Column mapping */}
                    <div className="p-4 rounded-lg bg-white border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold text-gray-900">Column Mapping</div>
                        <div className="text-xs text-gray-500">Target: {SOURCES.find(s => s.key === selectedSource)?.label}</div>
                      </div>
                      {Object.keys(combinedPreview[0] || {}).length === 0 ? (
                        <div className="text-gray-600 text-sm">No columns to map</div>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-auto">
                          {Object.keys(combinedPreview[0] || {}).map((col) => (
                            <div key={col} className="flex items-center gap-3">
                              <div className="w-1/2 text-xs text-gray-600 truncate">
                                <span className="font-medium text-gray-900">{col}</span>
                                <span className="ml-2 text-[10px] px-1 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-600">{inferredTypes[col] || 'string'}</span>
                              </div>
                              <select
                                className="input h-9 w-1/2"
                                value={columnMapping[col] || ''}
                                onChange={(e) => updateMapping(col, e.target.value)}
                              >
                                <option value="">— map to —</option>
                                {canonicalFields[selectedSource].map((f) => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {Object.entries(results).map(([name, res]) => (
                      <div key={name} className="p-4 rounded-lg bg-white border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-gray-900">{name}</div>
                          <div className="text-xs text-gray-500">{selectedSource.toUpperCase()}</div>
                        </div>
                        {!res ? (
                          <div className="text-gray-600 text-sm">No result</div>
                        ) : res.status === 'ok' ? (
                          <div className="text-sm space-y-1">
                            <div className="text-success-400">Rows ingested: {res.rows_ingested}</div>
                            {res.warnings.length > 0 && (
                              <div className="text-warning-400">Warnings: {res.warnings.length}</div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm">
                            <div className="text-danger-400 mb-1">Errors: {res.errors.length}</div>
                            <ul className="list-disc list-inside text-xs text-gray-700 space-y-1">
                              {res.errors.slice(0, 3).map((e, idx) => (
                                <li key={idx}>Row {e.row}: {e.message}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'validation' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Warnings table */}
                  <div>
                    <div className="mb-2 text-sm text-gray-700">Warnings ({aggregatedWarnings.length})</div>
                    <div className="overflow-auto border border-gray-200 rounded-lg max-h-96">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 border-b border-gray-200">File</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 border-b border-gray-200">Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aggregatedWarnings.map((w, idx) => (
                            <tr key={idx} className="odd:bg-white even:bg-gray-50">
                              <td className="px-3 py-2 text-gray-800 border-b border-gray-100">{w.file}</td>
                              <td className="px-3 py-2 text-gray-800 border-b border-gray-100">{w.message}</td>
                            </tr>
                          ))}
                          {aggregatedWarnings.length === 0 && (
                            <tr><td className="px-3 py-4 text-gray-500" colSpan={2}>No warnings</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Errors table */}
                  <div>
                    <div className="mb-2 text-sm text-gray-700">Errors ({aggregatedErrors.length})</div>
                    <div className="overflow-auto border border-gray-200 rounded-lg max-h-96">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 border-b border-gray-200">File</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 border-b border-gray-200">Row</th>
                            <th className="px-3 py-2 text-left font-medium text-gray-700 border-b border-gray-200">Message</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aggregatedErrors.map((er, idx) => (
                            <tr key={idx} className="odd:bg-white even:bg-gray-50">
                              <td className="px-3 py-2 text-gray-800 border-b border-gray-100">{er.file}</td>
                              <td className="px-3 py-2 text-gray-800 border-b border-gray-100">{er.row}</td>
                              <td className="px-3 py-2 text-gray-800 border-b border-gray-100">{er.message}</td>
                            </tr>
                          ))}
                          {aggregatedErrors.length === 0 && (
                            <tr><td className="px-3 py-4 text-gray-500" colSpan={3}>No errors</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'merge' && (
                <div className="p-6 rounded-lg bg-white border border-gray-200 text-gray-700">
                  <div className="text-sm mb-2 font-medium text-gray-900">Merge Workspace (Coming Soon)</div>
                  <p className="text-sm text-gray-600">Here you will be able to compare two uploads side-by-side, resolve conflicts, and commit merged data.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default DataUpload;
