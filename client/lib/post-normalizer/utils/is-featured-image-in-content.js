/**
 * External dependencies
 */
import { findIndex } from 'lodash';

/**
 * Internal dependencies
 */
import { isPhotonHost } from 'calypso/lib/post-normalizer/utils/is-photon-host';
import { thumbIsLikelyImage } from 'calypso/lib/post-normalizer/utils/thumb-is-likely-image';
import { getUrlParts } from 'calypso/lib/url';

function getPathname( uri ) {
	const { pathname, hostname } = getUrlParts( uri );
	if ( isPhotonHost( hostname ) ) {
		return pathname.substring( pathname.indexOf( '/', 1 ) );
	}
	return pathname;
}

/** returns whether or not a posts featuredImages is contained within the contents
 *
 * @param {object} post - the post to check
 * @returns {boolean|number} false if featuredImage is not within content content_images.
 *   otherwise returns the index of the dupe in post.images.
 */
export function isFeaturedImageInContent( post ) {
	if ( thumbIsLikelyImage( post.post_thumbnail ) ) {
		const featuredImagePath = getPathname( post.post_thumbnail.URL );

		const indexOfContentImage = findIndex(
			post.images,
			( img ) => getPathname( img.src ) === featuredImagePath,
			1
		); // skip first element in post.images because it is always the featuredImage

		if ( indexOfContentImage > 0 ) {
			return indexOfContentImage;
		}
	}

	return false;
}
