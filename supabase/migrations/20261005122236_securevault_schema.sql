/*
# SecureVault - Complete Database Schema

## Overview
Creates the full schema for SecureVault, a personal digital locker for students.
All tables are user-scoped with RLS policies so each student only sees their own data.

## New Tables
1. `profiles` - Extends auth.users with display name and avatar
2. `documents` - Stores uploaded document metadata (files go to Storage)
3. `personal_info` - Student personal information (one row per user)
4. `activity_log` - Audit trail of user actions
5. `document_views` - Tracks recently viewed documents

## Security
- RLS enabled on all tables
- Owner-scoped CRUD policies (auth.uid() = user_id) on all tables
- user_id columns default to auth.uid() for safe inserts
*/

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  description text DEFAULT '',
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  storage_path text NOT NULL,
  tags text[] DEFAULT '{}',
  is_favorite boolean NOT NULL DEFAULT false,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select_own" ON documents;
CREATE POLICY "documents_select_own" ON documents FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_insert_own" ON documents;
CREATE POLICY "documents_insert_own" ON documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_update_own" ON documents;
CREATE POLICY "documents_update_own" ON documents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_delete_own" ON documents;
CREATE POLICY "documents_delete_own" ON documents FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_is_deleted ON documents(is_deleted);

-- 3. Personal information table
CREATE TABLE IF NOT EXISTS personal_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  student_id text DEFAULT '',
  college text DEFAULT '',
  course text DEFAULT '',
  branch text DEFAULT '',
  year_semester text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  emergency_contact text DEFAULT '',
  blood_group text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE personal_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "personal_info_select_own" ON personal_info;
CREATE POLICY "personal_info_select_own" ON personal_info FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "personal_info_insert_own" ON personal_info;
CREATE POLICY "personal_info_insert_own" ON personal_info FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "personal_info_update_own" ON personal_info;
CREATE POLICY "personal_info_update_own" ON personal_info FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "personal_info_delete_own" ON personal_info;
CREATE POLICY "personal_info_delete_own" ON personal_info FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text DEFAULT '',
  entity_id uuid,
  details text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_log_select_own" ON activity_log;
CREATE POLICY "activity_log_select_own" ON activity_log FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_log_insert_own" ON activity_log;
CREATE POLICY "activity_log_insert_own" ON activity_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_log_delete_own" ON activity_log;
CREATE POLICY "activity_log_delete_own" ON activity_log FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);

-- 5. Document views table (recently viewed)
CREATE TABLE IF NOT EXISTS document_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now()
);

ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "document_views_select_own" ON document_views;
CREATE POLICY "document_views_select_own" ON document_views FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "document_views_insert_own" ON document_views;
CREATE POLICY "document_views_insert_own" ON document_views FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "document_views_delete_own" ON document_views;
CREATE POLICY "document_views_delete_own" ON document_views FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_document_views_user_id ON document_views(user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.personal_info (user_id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
