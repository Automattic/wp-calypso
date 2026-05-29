/**
 * MIME types accepted by the ATmosphere image upload flow.
 * Mirrors the backend's allowed-types list (see CM-670 spec).
 */
export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';

/**
 * Maximum number of images attachable to a single ATmosphere post.
 * Mirrors the Bluesky/AT Protocol limit on `app.bsky.embed.images#main`.
 */
export const MAX_IMAGES = 4;
