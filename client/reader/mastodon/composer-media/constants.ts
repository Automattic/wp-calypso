// Per CM-675: 8 MB cap, 4 images max, jpeg/png/gif/webp.
// Mastodon instances ALSO accept image/gif as a first-class type and process
// animated GIFs server-side (some convert to gifv on the fly). We pass GIFs
// through unchanged.
export const MAX_IMAGES = 4;
export const MAX_BYTES_PER_IMAGE = 8_000_000;
export const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/gif,image/webp';
export const ACCEPTED_MIME_SET: ReadonlySet< string > = new Set( [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
] );
