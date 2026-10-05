import { supabase } from '@/lib/supabase';

export async function logActivity(
  action: string,
  entityType: string = '',
  entityId: string | null = null,
  details: string = ''
): Promise<void> {
  try {
    await supabase.from('activity_log').insert({
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });
  } catch {
    // Activity logging is best-effort; don't block user actions
  }
}
