
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const bucket =
  process.env.NEXT_PUBLIC_STORAGE_BUCKET || "wedding-photos";

// ตรวจสอบว่ามีการตั้งค่า Supabase หรือไม่
const isSupabaseConfigured = Boolean(url && key);

// สร้าง Client เฉพาะเมื่อมีค่าที่ถูกต้อง
export const supabase = isSupabaseConfigured
  ? createClient(url!, key!)
  : null;

// ชื่อ Storage Bucket
export { bucket };

// สร้าง URL สำหรับรูปภาพ
export function publicImageUrl(path: string) {
  if (!supabase) {
    console.warn("Supabase is not configured.");
    return "";
  }

  if (!path) return "";

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
