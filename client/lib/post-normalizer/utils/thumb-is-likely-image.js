/**
 * Internal Dependencies
 */
import { isUrlLikelyAnImage } from 'calypso/lib/post-normalizer/utils/is-url-likely-an-image';

/**
 * Determine if a post thumbnail is likely an image
 *
 * @param  {object} thumb the thumbnail object from a post
 * @returns {boolean}       whether or not we think this is an image
 */
export function thumbIsLikelyImage( thumb ) {
	if ( ! thumb || ! thumb.URL ) {
		return false;
	}
	// this doesn't work because jetpack 4.2 lies
	// normally I wouldn't leave commented code in, but it's the best way to explain what not to do
	//if ( startsWith( thumb.mime_type, 'image/' ) ) {
	//	return true;
	// }
	return isUrlLikelyAnImage( thumb.URL );
}
