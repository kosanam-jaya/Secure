import type { DocumentCategory } from '@/types';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(date: string | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function getFileIcon(fileType: string): string {
  if (fileType.includes('pdf')) return 'pdf';
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.includes('word') || fileType.includes('msword')) return 'word';
  if (fileType.includes('sheet') || fileType.includes('excel')) return 'excel';
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return 'ppt';
  if (fileType.includes('text') || fileType.includes('csv')) return 'text';
  return 'file';
}

const categoryKeywords: Record<DocumentCategory, string[]> = {
  'College ID': ['id', 'card', 'identity', 'badge'],
  'Marksheets': ['mark', 'marksheet', 'grade', 'transcript', 'result', 'score', 'gpa'],
  'Certificates': ['certificate', 'cert', 'achievement', 'completion', 'award'],
  'Resume': ['resume', 'cv', 'curriculum'],
  'Internship': ['internship', 'intern', 'offer', 'training'],
  'Projects': ['project', 'report', 'documentation', 'source'],
  'Scholarships': ['scholarship', 'scholar', 'grant', 'fellowship', 'stipend'],
  'Government Documents': ['aadhaar', 'pan', 'passport', 'license', 'voter', 'government', 'govt', 'national'],
  'Personal': ['personal', 'photo', 'selfie', 'portrait'],
  'Other': [],
};

export function suggestCategory(fileName: string, fileType: string): DocumentCategory {
  const lowerName = fileName.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => lowerName.includes(kw))) {
      return category as DocumentCategory;
    }
  }
  if (fileType.startsWith('image/')) return 'Personal';
  if (fileType === 'application/pdf') return 'Certificates';
  return 'Other';
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.pop()!.toUpperCase() : 'FILE';
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
