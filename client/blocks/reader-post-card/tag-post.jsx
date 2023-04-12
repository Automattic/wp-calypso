import PropTypes from 'prop-types';
import ReaderExcerpt from 'calypso/blocks/reader-excerpt';
import AutoDirection from 'calypso/components/auto-direction';
import FeaturedAsset from './featured-asset';

const TagPost = ( { post, postByline, isDiscover, expandCard, postKey, isExpanded, site } ) => {
	const onVideoThumbnailClick =
		post.canonical_media?.mediaType === 'video'
			? () => expandCard( { postKey, post, site } )
			: null;

	return (
		<div className="reader-post-card__post">
			<div className="reader-post-card__post-details">
				<AutoDirection>
					<h2 className="reader-post-card__title">
						<a className="reader-post-card__title-link" href={ post.URL }>
							{ post.title }
						</a>
					</h2>
				</AutoDirection>
				<ReaderExcerpt post={ post } isDiscover={ isDiscover } />
				{ postByline }
			</div>
			<FeaturedAsset
				post={ post }
				canonicalMedia={ post.canonical_media }
				postUrl={ post.URL }
				onVideoThumbnailClick={ onVideoThumbnailClick }
				isVideoExpanded={ isExpanded }
				isTagPost={ true }
			/>
		</div>
	);
};

TagPost.propTypes = {
	post: PropTypes.object.isRequired,
	isDiscover: PropTypes.bool,
};

export default TagPost;
