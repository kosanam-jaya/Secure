export type DocumentCategory =
  | 'College ID'
  | 'Marksheets'
  | 'Certificates'
  | 'Resume'
  | 'Internship'
  | 'Projects'
  | 'Scholarships'
  | 'Government Documents'
  | 'Personal'
  | 'Other';

export const CATEGORIES: DocumentCategory[] = [
  'College ID',
  'Marksheets',
  'Certificates',
  'Resume',
  'Internship',
  'Projects',
  'Scholarships',
  'Government Documents',
  'Personal',
  'Other',
];

export interface Profile {
  id: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  category: DocumentCategory | string;
  description: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  tags: string[];
  is_favorite: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PersonalInfo {
  id: string;
  user_id: string;
  full_name: string;
  student_id: string;
  college: string;
  course: string;
  branch: string;
  year_semester: string;
  email: string;
  phone: string;
  address: string;
  emergency_contact: string;
  blood_group: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: string;
  created_at: string;
}

export interface DocumentView {
  id: string;
  user_id: string;
  document_id: string;
  viewed_at: string;
  document?: Document;
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  'PDF': ['application/pdf'],
  'Images': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  'Word': ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'Excel': ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  'PowerPoint': ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  'Text': ['text/plain', 'text/csv'],
};

export const ALL_ALLOWED_MIME_TYPES = Object.values(ALLOWED_FILE_TYPES).flat();
