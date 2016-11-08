/**
 * External Dependencies
 */
import React from 'react';
import { find, endsWith, some, } from 'lodash';
import url from 'url';

/**
 * Internal Dependencies
 */
import FeaturedVideo from './featured-video';
import FeaturedImage from './featured-image';

const candidateForFeature = ( media ) => {
	if ( ! media ) {
		return false;
	}

	if ( media.mediaType === 'image' ) {
		const image = media;

		const imageIsTallEnough = 350 <= image.width || 350 <= image.naturalWidth;
		const imageIsWideEnough = 85 <= image.height || 85 <= image.naturalHeight;

		return imageIsTallEnough && imageIsWideEnough;
	} else if ( media.mediaType === 'video' ) {
		// we need to have a thumbnail and know how to autoplay it
		return media.thumbnailUrl && media.autoplayIframe;
	}

	return true;
};

// jetpack lies about thumbnails so we need to make sure its actually an image. See: thumbIsLikelyImage in pick-canonical-image rule
const uriIsLikelyAnImage = ( uri ) => {
	const withoutQuery = url.parse( uri ).pathname;
	return some( [ '.jpg', '.jpeg', '.png', '.gif' ], ext => endsWith( withoutQuery, ext ) );
};

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

	if ( post.featured_image && uriIsLikelyAnImage( post.featured_image ) ) {
		return <FeaturedImage imageUri={ post.featured_image } href={ post.URL } />;
	}

	const featuredMedia = find( post.content_media, candidateForFeature );

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
