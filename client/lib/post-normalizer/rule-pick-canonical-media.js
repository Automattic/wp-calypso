/**
 * External dependencies
 */
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import { isUrlLikelyAnImage } from './utils';
import safeImageUrl from 'calypso/lib/safe-image-url';

/** Returns true if an image is large enough to be a featured asset
 *
 * @param {object} image - image must have a width and height property
 * @returns {boolean} true if large enough, false if image undefined or too small
 */
function isImageLargeEnoughForFeature( image ) {
	if ( ! image ) {
		return false;
	}
	const imageIsTallEnough = 100 <= image.width;
	const imageIsWideEnough = 75 <= image.height;

	return imageIsTallEnough && imageIsWideEnough;
}

function isCandidateForFeature( media ) {
	if ( ! media ) {
		return false;
	}

	if ( media.mediaType === 'image' ) {
		return isImageLargeEnoughForFeature( media ) && safeImageUrl( media.src );
	} else if ( media.mediaType === 'video' ) {
		// we need to know how to autoplay it which probably means we know how to get a thumbnail
		return media.autoplayIframe;
	}

	return false;
}

/*
 * Given a post:
 *  1. prefer to return the post's featured image ( post.post_thumbnail )
 *  2. if there is no usable featured image, use the media that appears first in the content of the post
 *  3. if there is no eligible asset, return null
 */
export default function pickCanonicalMedia( post ) {
	if ( ! post ) {
		return post;
	}

	// jetpack lies about thumbnails/featured_images so we need to make sure its actually an image
	if (
		isUrlLikelyAnImage( post.featured_image ) &&
		( ( ! post.post_thumbnail && post.is_jetpack ) || // some jetpack sites dont create post_thumbnail
			isImageLargeEnoughForFeature( post.post_thumbnail ) ) &&
		safeImageUrl( post.featured_image )
	) {
		post.canonical_media = {
			src: post.featured_image,
			height: get( post, 'post_thumbnail.height' ),
			width: get( post, 'post_thumbnail.width' ),
			mediaType: 'image',
		};
		return post;
	}

	const canonicalMedia = find( post.content_media, isCandidateForFeature );

	if ( canonicalMedia ) {
		post.canonical_media = canonicalMedia;
	}

	return post;
}
