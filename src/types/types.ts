import { CreatePostFormValues } from "@/validation/validation";
import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";




export type ApiOk<T> = {
  ok: true;
  status: number;
  requestId?: string;
  message?: string;
  data: T;
};

export type NavListType = {
  items: NavItem[];
  pathname: string;
  expanded: boolean;
  onNavigate?: () => void;
}


export type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Array<"owner" | "user">;
};


export type LoginForm = {
  email: string;
  password: string;
};


export type User = {
  _id: string;
  username: string;
  email: string;
  role: "owner" | "user";
  createdAt: string;
  updatedAt: string;
};


export type UsersResponse = {
  items: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
  }
};



export type UploadedImage = {
  kind: "image";
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
};

export type UploadedVideo = {
  kind: "video";
  url: string;
  publicId: string;
  duration?: number;
  format?: string;
  bytes?: number;
};

export type Targets = { facebook: boolean; instagram: boolean; tiktok: boolean };

export type ImagesMedia = { kind: "images"; images: UploadedImage[] };
export type VideoMedia = { kind: "video"; video: UploadedVideo };

export type TikTokPrivacy = "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "SELF_ONLY";

export type TikTokSettings = {
  privacy_level: TikTokPrivacy;
  disable_comment: boolean;
  disable_duet: boolean;
  disable_stitch: boolean;
};

export type YoutubePrivacyStatus = "private" | "public" | "unlisted";
export type YoutubeSettings = {
  title?: string;
  description?: string;
  privacyStatus?: YoutubePrivacyStatus;
};


export type CreatePostPayload =
  | {
    action: "draft" | "publish";
    caption: string;
    hashtags: string[];
    targets: Targets;
    media: ImagesMedia;
  }
  | {
    action: "draft" | "publish";
    caption: string;
    hashtags: string[];
    targets: Targets;
    media: VideoMedia;
    tiktokSettings?: TikTokSettings;
    youtubeSettings?: YoutubeSettings;
  };


export type MediaKind = "images" | "video";

export type ConnectionStatus = {
  metaConnected: boolean;
  tiktokConnected: boolean;
  youtubeConnected: boolean;
};



export const SUPPORTED_PLATFORMS = [
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
] as const;

export type Platform = (typeof SUPPORTED_PLATFORMS)[number];

export type PlatformBadgesProps = {
  targets?: Partial<Record<Platform, boolean>>;
};

export type PlatformState = {
  connected: boolean;
  active: boolean;
  accountName?: string;
  accountExternalId?: string;
};


export type Status = {
  connections: Record<Platform, PlatformState>;
};

export type MetaPage = { id: string; name: string };

export type MetaPagesResponse = ApiOk<{ pages: MetaPage[] }>;
export type MetaSelectPageResponse = ApiOk<{ connected: true }>;

export type ImagesError = { images: { message: string; type: string } };
export type VideoError = { video: { message: string; type: string } };






export type Post = {
  action: string
  caption: string
  createdAt: string
  hashtags: string[]
  media: ImagesMedia | VideoMedia

  publishResults: {
    facebook: {
      status: string | null
      externalId: string | null
      error: string | null
      publishedAt: string | null
    }
    instagram: {
      status: string | null
      externalId: string | null
      error: string | null
      publishedAt: string | null
    }
    tiktok: {
      status: string | null
      externalId: string | null
      error: string | null
      publishedAt: string | null
    }
    youtube: {
      status: string | null
      externalId: string | null
      error: string | null
      publishedAt: string | null
    }
  }

  status: "published" | "failed" | "draft" | "queued" | "publishing" | "partial"

  targets: {
    facebook: boolean
    instagram: boolean
    tiktok: boolean
    youtube: boolean
  }

  updatedAt: string

  user: {
    _id: string
    username: string
  }

  _id: string
}






export type PostsResponse = {
  items: Post[]
  meta: {
    page: number
    limit: number
    total: number
  }
}


type PublishResult = {
  status: string | null;
  externalId: string | null;
  error: string | null;
  publishedAt: string | null;
};

export type CreatePostResponse = {
  meta: { failedPlatforms: Platform[], publishedPlatforms: Platform[] },
  post: {
    action: string
    caption: string
    createdAt: string
    hashtags: string[]
    media: ImagesMedia | VideoMedia
    publishResults: {
      facebook: PublishResult,
      instagram: PublishResult
      tiktok: PublishResult
      youtube: PublishResult,
    }
    status: string
    targets: { facebook: boolean, instagram: boolean, tiktok: boolean, youtube: boolean; }
    updatedAt: string
    user: string
    _id: string

  }
}




export type PlatformResultStatus = "idle" | "failed" | "published";
export type PostStatus = "draft" | "queued" | "publishing" | "published" | "partial" | "failed";

export type PlatformPublishResult = {
  status: PlatformResultStatus | null;
  externalId: string | null;
  error: string | null;
  publishedAt: string | null;
};

export type PostTest = {
  _id: string;
  user: { _id: string; username: string };
  action: "draft" | "publish" | string;
  caption: string;
  hashtags: string[];
  media: ImagesMedia | VideoMedia;
  targets: Record<Platform, boolean>;
  publishResults: Record<Platform, PlatformPublishResult>;
  status: PostStatus | string;
  createdAt: string;
  updatedAt: string;
};


export type PostTargetsSectionProps = {
  form: UseFormReturn<CreatePostFormValues>;
  conn: ConnectionStatus;
  isSubmitting: boolean;
  onPublish: () => void;
  onSaveDraft: () => void;
};

export type PlatformRowProps = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  connected: boolean;
  connectedLabel?: string;
  disconnectedLabel?: string;
  hint?: string;
  icon?: ReactNode;
  onChange: (value: boolean) => void;
};


export type UsersTableProps = {
  users?: UsersResponse;
};

export type PostTableProps = {
  posts?: PostsResponse;
}


export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};