import PropTypes from 'prop-types';
import ReaderFeaturedVideo from 'calypso/blocks/reader-featured-video';
import ReaderFeaturedImages from 'calypso/blocks/reader-post-card/featured-images';

const FeaturedAsset = ( {
	post,
	canonicalMedia,
	postUrl,
	allowVideoPlaying = true,
	onVideoThumbnailClick,
	isVideoExpanded,
	isCompactPost,
	hasExcerpt,
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
				isCompactPost={ isCompactPost }
				hasExcerpt={ hasExcerpt }
			/>
		);
	}

	return (
		<ReaderFeaturedImages
			post={ post }
			postUrl={ postUrl }
			canonicalMedia={ canonicalMedia }
			isCompactPost={ isCompactPost }
			hasExcerpt={ hasExcerpt }
		/>
	);
};

FeaturedAsset.propTypes = {
	post: PropTypes.object,
	canonicalMedia: PropTypes.object,
	postUrl: PropTypes.string,
	allowVideoPlaying: PropTypes.bool,
	onVideoThumbnailClick: PropTypes.func,
	isVideoExpanded: PropTypes.bool,
	hasExcerpt: PropTypes.bool,
};

export default FeaturedAsset;
