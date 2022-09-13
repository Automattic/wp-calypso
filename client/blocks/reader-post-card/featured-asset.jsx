import PropTypes from 'prop-types';
import ReaderFeaturedVideo from 'calypso/blocks/reader-featured-video';
import ReaderFeaturedImages from 'calypso/blocks/reader-post-card/featured-images';

const FeaturedAsset = ( {
	post,
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

	return (
		<ReaderFeaturedImages post={ post } postUrl={ postUrl } canonicalMedia={ canonicalMedia } />
	);
};

FeaturedAsset.propTypes = {
	post: PropTypes.object,
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
