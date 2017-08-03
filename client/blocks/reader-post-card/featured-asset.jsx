/** @format */
/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import ReaderFeaturedVideo from 'blocks/reader-featured-video';
import ReaderFeaturedImage from 'blocks/reader-featured-image';

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
	canonicalMedia: React.PropTypes.object,
	postUrl: React.PropTypes.string,
	allowVideoPlaying: React.PropTypes.bool,
	onVideoThumbnailClick: React.PropTypes.func,
	isVideoExpanded: React.PropTypes.bool,
};

FeaturedAsset.defaultProps = {
	allowVideoPlaying: true,
};

export default FeaturedAsset;
