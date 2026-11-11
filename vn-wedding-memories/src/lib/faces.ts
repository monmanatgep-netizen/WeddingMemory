
"use client";

let faceApiPromise: Promise<any> | null = null;

// ==========================================
// LOAD FACE API
// ==========================================

async function faceApi(): Promise<any> {
  // ป้องกันการทำงานบน Server
  if (typeof window === "undefined") {
    throw new Error(
      "Face recognition สามารถทำงานได้เฉพาะบน Browser"
    );
  }

  // ใช้ Instance เดิมหากโหลดแล้ว
  if (faceApiPromise) {
    return faceApiPromise;
  }

  faceApiPromise = (async () => {
    try {
      const mod: any = await import("face-api.js");

      const api = mod.default || mod;

      const base = "/models";

      // โหลดโมเดลทั้งหมดพร้อมกัน
      await Promise.all([
        api.nets.ssdMobilenetv1.loadFromUri(base),
        api.nets.faceLandmark68Net.loadFromUri(base),
        api.nets.faceRecognitionNet.loadFromUri(base),
      ]);

      return api;

    } catch (error) {
      // อนุญาตให้ลองโหลดใหม่เมื่อเกิดข้อผิดพลาด
      faceApiPromise = null;

      console.error(
        "Face API initialization failed:",
        error
      );

      throw new Error(
        "ไม่สามารถโหลดระบบจดจำใบหน้าได้ กรุณาตรวจสอบไฟล์โมเดลใน public/models"
      );
    }
  })();

  return faceApiPromise;
}

// ==========================================
// GET FACE DESCRIPTORS
// ==========================================

export async function getFaceDescriptors(
  file: File
): Promise<number[][]> {

  if (typeof window === "undefined") {
    throw new Error(
      "ไม่สามารถประมวลผลใบหน้าบน Server ได้"
    );
  }

  if (!(file instanceof File)) {
    throw new Error("ไฟล์ภาพไม่ถูกต้อง");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("กรุณาเลือกไฟล์รูปภาพ");
  }

  const api = await faceApi();

  const url = URL.createObjectURL(file);

  try {
    // โหลดภาพ
    const img = await api.fetchImage(url);

    // ตรวจจับใบหน้าและสร้าง Face Descriptor
    const detections = await api
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    // แปลง Float32Array เป็น number[]
    return detections.map((d: any) =>
      Array.from(
        d.descriptor as Float32Array
      )
    );

  } catch (error) {
    console.error(
      "Face detection failed:",
      error
    );

    throw new Error(
      "ไม่สามารถตรวจจับใบหน้าได้ กรุณาลองใช้ภาพอื่น"
    );

  } finally {
    // คืนหน่วยความจำของ Object URL
    URL.revokeObjectURL(url);
  }
}
