/*
# SecureVault Storage Bucket Setup

Creates a private storage bucket for document uploads.
Each user's files are stored under a folder named after their user ID.
Storage policies ensure users can only access their own folder.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'image/svg+xml'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can only access files in their own folder (user_id/)
DROP POLICY IF EXISTS "documents_storage_select_own" ON storage.objects;
CREATE POLICY "documents_storage_select_own"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "documents_storage_insert_own" ON storage.objects;
CREATE POLICY "documents_storage_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "documents_storage_update_own" ON storage.objects;
CREATE POLICY "documents_storage_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "documents_storage_delete_own" ON storage.objects;
CREATE POLICY "documents_storage_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);
