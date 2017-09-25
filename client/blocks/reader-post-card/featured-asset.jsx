/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import ReaderFeaturedImage from 'blocks/reader-featured-image';
import ReaderFeaturedVideo from 'blocks/reader-featured-video';

const FeaturedAsset = ( {
	canonicalMedia,
	postUrl,
	allowVideoPlaying,
	onVideoThumbnailClick,
	isVideoExpanded,
} ) => {
	if ( ! canonicalMedia ) {
		return null;
	}

	if ( canonicalMedia.mediaType === 'video' ) {
		return (
			<ReaderFeaturedVideo
				{ ...canonicalMedia }
				videoEmbed={ canonicalMedia }
				allowPlaying={ allowVideoPlaying }
				onThumbnailClick={ onVideoThumbnailClick }
				isExpanded={ isVideoExpanded }
			/>
		);
	}

	return <ReaderFeaturedImage imageUrl={ canonicalMedia.src } href={ postUrl } />;
};

FeaturedAsset.propTypes = {
	canonicalMedia: PropTypes.object,
	postUrl: PropTypes.string,
	allowVideoPlaying: PropTypes.bool,
	onVideoThumbnailClick: PropTypes.func,
	isVideoExpanded: PropTypes.bool,
};

FeaturedAsset.defaultProps = {
	allowVideoPlaying: true,
};

export default FeaturedAsset;
