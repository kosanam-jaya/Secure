import { useState, useRef, type FormEvent } from 'react';
import { Upload, X, File as FileIcon, Loader2, Sparkles, Tag, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { CATEGORIES, MAX_FILE_SIZE, ALL_ALLOWED_MIME_TYPES, type DocumentCategory } from '@/types';
import { suggestCategory, formatBytes, cn } from '@/lib/utils';
import { logActivity } from '@/lib/activity';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export function UploadModal({ open, onClose, onUploaded }: UploadModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Other');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setCategory('Other');
    setDescription('');
    setTagsInput('');
    setExpiryDate('');
  };

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    if (selectedFile.size > MAX_FILE_SIZE) {
      showToast(`File too large. Maximum size is ${formatBytes(MAX_FILE_SIZE)}`, 'error');
      return;
    }

    if (!ALL_ALLOWED_MIME_TYPES.includes(selectedFile.type) && selectedFile.type !== '') {
      showToast('File type not supported. Please upload PDF, images, or common document formats.', 'error');
      return;
    }

    setFile(selectedFile);
    if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
    const suggested = suggestCategory(selectedFile.name, selectedFile.type);
    setCategory(suggested);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setLoading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) {
      showToast(`Upload failed: ${uploadError.message}`, 'error');
      setLoading(false);
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const { error: dbError } = await supabase.from('documents').insert({
      title,
      category,
      description,
      file_name: file.name,
      file_type: file.type || 'application/octet-stream',
      file_size: file.size,
      storage_path: fileName,
      tags,
      expiry_date: expiryDate || null,
    });

    if (dbError) {
      showToast(`Failed to save document: ${dbError.message}`, 'error');
      await supabase.storage.from('documents').remove([fileName]);
      setLoading(false);
      return;
    }

    await logActivity('upload', 'document', null, `Uploaded "${title}"`);

    showToast('Document uploaded successfully!', 'success');
    setLoading(false);
    resetForm();
    onUploaded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-strong rounded-2xl p-6 md:p-8 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Upload Document</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Drop zone */}
          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all',
                dragOver ? 'border-blue-400 bg-blue-500/10' : 'border-white/15 hover:border-white/30 hover:bg-white/5'
              )}
            >
              <Upload className="h-10 w-10 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Drag and drop your file here</p>
              <p className="text-sm text-slate-500 mt-1">or click to browse</p>
              <p className="text-xs text-slate-600 mt-3">PDF, Images, Word, Excel, PowerPoint, Text — Max 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <FileIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{formatBytes(file.size)} • {file.type || 'Unknown type'}</p>
              </div>
              <button type="button" onClick={() => setFile(null)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {file && (
            <>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Document title"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block flex items-center gap-1.5">
                  Category
                  <span className="flex items-center gap-1 text-xs text-blue-400 font-normal">
                    <Sparkles className="h-3 w-3" /> AI suggested
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        category === cat
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Optional description"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" /> Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. important, semester, 2024"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Expiry / Renewal Date (optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400/50 transition-all [color-scheme:dark]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Upload Document</>}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
