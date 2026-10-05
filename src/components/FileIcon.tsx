import { FileText, Image, FileType2, FileSpreadsheet, Presentation, File } from 'lucide-react';
import { getFileIcon } from '@/lib/utils';
import { cn } from '@/lib/utils';

const iconMap: Record<string, { icon: typeof FileText; color: string; bg: string }> = {
  pdf: { icon: FileText, color: 'text-red-400', bg: 'bg-red-500/10' },
  image: { icon: Image, color: 'text-green-400', bg: 'bg-green-500/10' },
  word: { icon: FileType2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  excel: { icon: FileSpreadsheet, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ppt: { icon: Presentation, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  text: { icon: FileText, color: 'text-slate-300', bg: 'bg-slate-500/10' },
  file: { icon: File, color: 'text-slate-400', bg: 'bg-slate-500/10' },
};

export function FileIcon({ fileType, size = 40, className }: { fileType: string; size?: number; className?: string }) {
  const key = getFileIcon(fileType);
  const { icon: Icon, color, bg } = iconMap[key] ?? iconMap.file;
  return (
    <div
      className={cn('flex items-center justify-center rounded-xl', bg, className)}
      style={{ width: size, height: size }}
    >
      <Icon className={color} style={{ width: size * 0.5, height: size * 0.5 }} />
    </div>
  );
}
