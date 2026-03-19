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
  buildYoutubeDescription,
  hasAnySelectedTarget,
} from "../_lib/create-post.helpers";

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
      tiktokSettings: {
        privacy_level: "PUBLIC_TO_EVERYONE",
        disable_comment: false,
        disable_duet: false,
        disable_stitch: false,
      },
      youtubeSettings: {
        privacyStatus: "private",
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
    const action = values.action;

    /**
     * Images flow
     */
    if (values.media.kind === "images") {
      const uploaded = await uploadManyImages(values.media.images);

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
     * Upload video and prepare payload
     */
    const uploaded = await uploadVideo(values.media.video);
    const youtubeDescription = buildYoutubeDescription(values);

    const payload: CreatePostPayload = {
      action,
      caption: values.caption,
      hashtags: values.hashtags,
      targets: values.targets,
      media: { kind: "video", video: uploaded },

      ...(values.targets.tiktok
        ? {
            tiktokSettings: {
              privacy_level: values.tiktokSettings!.privacy_level!,
              disable_comment: Boolean(values.tiktokSettings?.disable_comment),
              disable_duet: Boolean(values.tiktokSettings?.disable_duet),
              disable_stitch: Boolean(values.tiktokSettings?.disable_stitch),
            },
          }
        : {}),

      ...(values.targets.youtube
        ? {
            youtubeSettings: {
              title: values.caption?.trim() || "Untitled video",
              description: youtubeDescription,
              privacyStatus: values.youtubeSettings?.privacyStatus || "private",
            },
          }
        : {}),
    };

    mutate.mutate({ data: payload });
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