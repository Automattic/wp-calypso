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

const candidateForFeature = ( media ) => {
	if ( ! media ) {
		return false;
	}

	if ( media.mediaType === 'image' ) {
		const image = media;

		// image is not wide enough
		if ( image.naturalWidth < 350 ) {
			return false;
		}

		// image does not have enough area
		if ( ( image.naturalWidth * image.naturalHeight ) < 30000 ) {
			return false;
		}
	} else if ( media.mediaType === 'video' ) {
		// we do not know how to autoplay it
		return media.thumbnailUrl && media.autoplayIframe;
	}

	return true;
};

const FeaturedAsset = ( { post } ) => {
	if ( ! post ) {
		return null;
	}

	// take either the canonical image or if that doesn't exist, the first usable media in the content of the post
	const featuredMedia = candidateForFeature( post.featured_image )
		? post.featured_image
		: find( post.featured_media, candidateForFeature );

	if ( ! featuredMedia ) {
		return null;
	}

	const featuredAsset = featuredMedia.mediaType === 'video'
		? <FeaturedVideo { ...featuredMedia } videoEmbed={ featuredMedia } />
		: <FeaturedImage imageUri={ featuredMedia.src } href={ post.URL } />;

	return featuredAsset;
};

FeaturedAsset.propTypes = {
	post: React.PropTypes.object.isRequired,
};

export default FeaturedAsset;
