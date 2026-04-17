import { UploadedImage, UploadedVideo } from "@/types/types";

/**
 * Upload a single image to Cloudinary
 *
 * Returns basic info about the uploaded image
 */

export async function uploadImage(
  file: File,
  folder = "social-publishing/images"
): Promise<UploadedImage> {
  const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!uploadPreset || !cloudName) {
    throw new Error("Upload is not configured.");
  }

  if (!file) {
    throw new Error("Please select an image.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSize) {
    throw new Error("Image is too large. Maximum size is 10 MB.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData?.error?.message || "Image upload failed.");
    }

    return {
      kind: "image",
      url: responseData.secure_url,
      publicId: responseData.public_id,
      width: responseData.width,
      height: responseData.height,
      format: responseData.format,
      bytes: responseData.bytes,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Something went wrong while uploading the image."
    );
  }
}

/**
 * Upload multiple images one by one
 */
export async function uploadManyImages(
  files: File[],
  onProgress?: (uploadedCount: number, totalCount: number) => void
): Promise<UploadedImage[]> {
  if (!files.length) {
    throw new Error("Please select at least one image.");
  }

  const uploadedImages: UploadedImage[] = [];

  for (let index = 0; index < files.length; index++) {
    const uploadedImage = await uploadImage(files[index]);
    uploadedImages.push(uploadedImage);

    onProgress?.(index + 1, files.length);
  }

  return uploadedImages;
}

/**
 * Upload a video to Cloudinary
 *
 * Returns basic info about the uploaded video
 */


export async function uploadVideo(
  file: File,
  folder = "social-publishing/videos"
): Promise<UploadedVideo> {
  const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!uploadPreset || !cloudName) {
    throw new Error("Upload is not configured.");
  }

  if (!file) {
    throw new Error("Please select a video.");
  }

  if (!file.type.startsWith("video/")) {
    throw new Error("Only video files are allowed.");
  }

  // 50 MB
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("Video is too large. Maximum size is 50 MB.");
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);
  fd.append("folder", folder);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      {
        method: "POST",
        body: fd,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error?.message || "Video upload failed.");
    }

    return {
      kind: "video",
      url: data.secure_url,
      publicId: data.public_id,
      duration: data.duration,
      format: data.format,
      bytes: data.bytes,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error("Something went wrong while uploading the video.");
  }
}