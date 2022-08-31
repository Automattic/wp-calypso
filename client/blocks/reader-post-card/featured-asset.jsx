import PropTypes from 'prop-types';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import ReaderFeaturedVideo from 'calypso/blocks/reader-featured-video';

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

	return <ReaderFeaturedImage post={ post } href={ postUrl } fetched={ canonicalMedia.fetched } />;
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
