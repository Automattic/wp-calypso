import { useBreakpoint } from '@automattic/viewport-react';
import PropTypes from 'prop-types';
import ReaderExcerpt from 'calypso/blocks/reader-excerpt';
import ReaderPostEllipsisMenu from 'calypso/blocks/reader-post-options-menu/reader-post-ellipsis-menu';
import AutoDirection from 'calypso/components/auto-direction';
import FeaturedAsset from './featured-asset';

const CompactPost = ( {
	children,
	post,
	isDiscover,
	expandCard,
	postKey,
	isExpanded,
	site,
	postByline,
	teams,
} ) => {
	const onVideoThumbnailClick =
		post.canonical_media?.mediaType === 'video'
			? () => expandCard( { postKey, post, site } )
			: null;

	const isSmallScreen = useBreakpoint( '<660px' );

	return (
		<div className="reader-post-card__post">
			<div className="reader-post-card__post-content">
				<div className="reader-post-card__post-details">
					<div className="reader-post-card__post-heading">
						<div className="reader-post-card__post-title-meta">
							<AutoDirection>
								<h2 className="reader-post-card__title">
									<a className="reader-post-card__title-link" href={ post.URL }>
										{ post.title }
									</a>
								</h2>
							</AutoDirection>
							{ postByline }
						</div>
						{ ( ! post.canonical_media || isSmallScreen ) && (
							<ReaderPostEllipsisMenu
								site={ site }
								teams={ teams }
								post={ post }
								showFollow={ false }
							/>
						) }
					</div>
					<ReaderExcerpt post={ post } isDiscover={ isDiscover } />
				</div>
				{ post.canonical_media && (
					<div className="reader-post-card__post-media">
						{ ! isSmallScreen && (
							<ReaderPostEllipsisMenu
								site={ site }
								teams={ teams }
								post={ post }
								showFollow={ false }
							/>
						) }
						<FeaturedAsset
							post={ post }
							canonicalMedia={ post.canonical_media }
							postUrl={ post.URL }
							onVideoThumbnailClick={ onVideoThumbnailClick }
							isVideoExpanded={ isExpanded }
							isCompactPost={ true }
						/>
					</div>
				) }
			</div>
			{ children }
		</div>
	);
};

CompactPost.propTypes = {
	post: PropTypes.object.isRequired,
	postByline: PropTypes.object,
	isDiscover: PropTypes.bool,
};

export default CompactPost;
