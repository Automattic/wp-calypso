/**
 * Feed post display types
 *
 * @format
 * @type {Object} Types of post for display
 */

export const UNCLASSIFIED = 0;
export const PHOTO_ONLY = 1;
export const LARGE_BANNER = 2;
export const ONE_LINER = 4;
export const LANDSCAPE_BANNER = 8;
export const PORTRAIT_BANNER = 16;
export const GALLERY = 32;
export const VIDEO = 64;
export const THUMBNAIL = 128;
export const FEATURED_VIDEO = 512;
export const X_POST = 1024;

export default {
	UNCLASSIFIED,
	PHOTO_ONLY,
	LARGE_BANNER,
	ONE_LINER,
	LANDSCAPE_BANNER,
	PORTRAIT_BANNER,
	GALLERY,
	VIDEO,
	THUMBNAIL,
	FEATURED_VIDEO,
	X_POST,
};
