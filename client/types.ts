// Web stuff
export type URL = string;

// User stuff

// Site stuff
export type SiteId = number;
export type SiteSlug = string;

// Plan stuff
export type PlanSlug = string;

// Plugin stuff

// Post stuff
export type PostId = number;
export type PostType = 'page' | 'post' | string;

// Comment stuff
export type CommentId = number;

// Language stuff
export type Lazy< T > = () => T;
export type TimestampMS = ReturnType<typeof Date.now>;
export type TimerHandle = ReturnType<typeof setTimeout>;
