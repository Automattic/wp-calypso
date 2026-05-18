/**
 * Single source of truth for the post meta key that links a generated video
 * clip to its post. Registered server-side by the Jetpack Image Studio
 * extension; consumed both from the agent ability that persists the value
 * after generation and from the sidebar that reads it back.
 */
export const FEATURE_CLIP_META_KEY = '_jetpack_feature_clip_id';
