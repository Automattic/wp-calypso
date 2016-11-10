/**
 * External Dependencies
 */
import React from 'react';
import { find } from 'lodash';

/**
 * Internal Dependencies
 */
import FeaturedVideo from './featured-video';
import FeaturedImage from './featured-image';
import { isUrlLikelyAnImage } from '../../lib/post-normalizer/utils.js';

function isCandidateForFeature( media ) {
	if ( ! media ) {
		return false;
	}

	if ( media.mediaType === 'image' ) {
		const image = media;

		const imageIsTallEnough = 350 <= image.width;
		const imageIsWideEnough = 85 <= image.height;

		return imageIsTallEnough && imageIsWideEnough;
	} else if ( media.mediaType === 'video' ) {
		// we need to have a thumbnail and know how to autoplay it
		return media.thumbnailUrl && media.autoplayIframe;
	}

	return false;
}

/**
 * Given a post:
 *  1. prefer to return the post's featured image ( post.post_thumbnail )
 *  2. if there is no usable featured image, use the media that appears first in the content of the post
 *  3. if there is no eligible asset, return null
 */
const FeaturedAsset = ( { post } ) => {
	if ( ! post ) {
		return null;
	}

	// jetpack lies about thumbnails/featured_images so we need to make sure its actually an image
	if ( post.featured_image && isUrlLikelyAnImage( post.featured_image ) ) {
		return <FeaturedImage imageUri={ post.featured_image } href={ post.URL } />;
	}

	const featuredMedia = find( post.content_media, isCandidateForFeature );

	if ( featuredMedia && featuredMedia.mediaType === 'video' ) {
		return <FeaturedVideo { ...featuredMedia } videoEmbed={ featuredMedia } />;
	} else if ( featuredMedia && featuredMedia.mediaType === 'image' ) {
		return <FeaturedImage imageUri={ featuredMedia.src } href={ post.URL } />;
	}

	return null;
};

FeaturedAsset.propTypes = {
	post: React.PropTypes.object.isRequired,
};

export default FeaturedAsset;
