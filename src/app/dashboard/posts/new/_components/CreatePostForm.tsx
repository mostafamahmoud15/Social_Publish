"use client";

import * as React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PenSquare } from "lucide-react";

import { uploadManyImages, uploadVideo } from "@/lib/cloudinary";
import useCreatePost from "@/hooks/useCreatePost";
import { ConnectionStatus, CreatePostPayload } from "@/types/types";
import {
  CreatePostFormSchema,
  CreatePostFormValues,
} from "@/validation/validation";

import PostContentSection from "./PostContentSection";
import PostMediaSection from "./PostMediaSection";
import PostTargetsSection from "./PostTargetsSection";
import {
  hasAnySelectedTarget,
} from "../_lib/create-post.helpers";
import { toastFlow } from "@/lib/toast";

/**
 * Create post form
 */
export default function CreatePostForm() {
  /**
   * Platform connection status
   */
  const [conn] = React.useState<ConnectionStatus>({
    metaConnected: false,
    tiktokConnected: false,
    youtubeConnected: false,
  });

  /**
   * Form setup
   *
   * We keep TikTok / YouTube defaults in form state,
   * but we do not expose them in the UI anymore.
   *
   * Business rule:
   * - TikTok should always publish as Public
   * - YouTube should always publish as Public
   */
  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(CreatePostFormSchema),
    defaultValues: {
      action: "draft",
      caption: "",
      hashtags: [],
      hashtagDraft: "",
      targets: {
        facebook: false,
        instagram: false,
        tiktok: false,
        youtube: false,
      },
      media: {
        kind: "images",
        images: [],
      },
    },
    mode: "onChange",
  });

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  /**
   * Create post mutation
   */
  const mutate = useCreatePost();

  const kind = watch("media.kind");
  const targets = watch("targets");

  /**
   * Disable video-only targets when media is images
   */
  React.useEffect(() => {
    if (kind === "images" && targets.tiktok) {
      setValue("targets.tiktok", false, { shouldValidate: true });
    }

    if (kind === "images" && targets.youtube) {
      setValue("targets.youtube", false, { shouldValidate: true });
    }
  }, [kind, targets.tiktok, targets.youtube, setValue]);

  /**
   * Handle form submit
   */
  const onSubmit: SubmitHandler<CreatePostFormValues> = async (values) => {
    let toastId: string | number | undefined;

    try {
      const action = values.action;

      /**
       * Images flow
       */
      if (values.media.kind === "images") {
        toastId = toastFlow.loading("Uploading images...");

        const uploaded = await uploadManyImages(values.media.images);

        toastFlow.dismiss(toastId);

        const payload: CreatePostPayload = {
          action,
          caption: values.caption,
          hashtags: values.hashtags,
          targets: values.targets,
          media: { kind: "images", images: uploaded },
        };

        mutate.mutate({ data: payload });
        return;
      }

      /**
       * Video validations
       */
      if (!values.media.video) {
        throw new Error("Please select a video");
      }

      if (!hasAnySelectedTarget(values)) {
        throw new Error("Please select at least one platform");
      }

      /**
       * Video upload
       */
      toastId = toastFlow.loading("Uploading video...");

      const uploaded = await uploadVideo(values.media.video);

      toastFlow.dismiss(toastId);

      const payload: CreatePostPayload = {
        action,
        caption: values.caption,
        hashtags: values.hashtags,
        targets: values.targets,
        media: { kind: "video", video: uploaded },
      };

      mutate.mutate({ data: payload });

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

  
      if (toastId) toastFlow.dismiss(toastId);

      toastFlow.error(message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <PenSquare className="h-3.5 w-3.5" />
          Post Editor
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">Create Post</h1>
        <p className="text-sm text-muted-foreground">
          Write your content, add media, and choose your publishing platforms.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <PostContentSection form={form} />
        <PostMediaSection form={form} />
        <PostTargetsSection
          form={form}
          conn={conn}
          isSubmitting={isSubmitting}
          onPublish={() => {
            setValue("action", "publish", { shouldValidate: true });
            handleSubmit(onSubmit)();
          }}
          onSaveDraft={() => {
            setValue("action", "draft", { shouldValidate: true });
            handleSubmit(onSubmit)();
          }}
        />
      </form>
    </div>
  );
}