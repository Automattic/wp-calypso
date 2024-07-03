import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useState } from 'react';
import ReaderExcerpt from 'calypso/blocks/reader-excerpt';
import ReaderPostEllipsisMenu from 'calypso/blocks/reader-post-options-menu/reader-post-ellipsis-menu';
import AutoDirection from 'calypso/components/auto-direction';
import FeaturedAsset from './featured-asset';

const CompactPost = ( {
	children,
	post,
	expandCard,
	postKey,
	isExpanded,
	site,
	postByline,
	teams,
	openSuggestedFollows,
} ) => {
	const isSmallScreen = useBreakpoint( '<660px' );
	const [ hasExcerpt, setHasExcerpt ] = useState( true );
	const [ showExcerpt, setShowExcerpt ] = useState( ! isExpanded ?? true );
	const imagePostWithoutExcerpt = ( post.canonical_media && ! hasExcerpt ) || ! showExcerpt;
	const onVideoThumbnailClick =
		post.canonical_media?.mediaType === 'video'
			? () => {
					expandCard( { postKey, post, site } );
					setHasExcerpt( false ); // Render compact post without excerpt
					setShowExcerpt( false ); // Set showExcerpt to false to prevent excerpt from reappearing
			  }
			: null;

	return (
		<div className="reader-post-card__post">
			<div
				className={ clsx( 'reader-post-card__post-content', {
					'reader-post-card__no-excerpt': ! hasExcerpt,
				} ) }
			>
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
						{ ( imagePostWithoutExcerpt || ! post.canonical_media || isSmallScreen ) && (
							<ReaderPostEllipsisMenu
								site={ site }
								teams={ teams }
								post={ post }
								showFollow
								openSuggestedFollows={ openSuggestedFollows }
							/>
						) }
					</div>
					<ReaderExcerpt
						post={ post }
						hasExcerpt={ hasExcerpt }
						showExcerpt={ showExcerpt }
						setHasExcerpt={ setHasExcerpt }
					/>
				</div>
				{ post.canonical_media && (
					<div className="reader-post-card__post-media">
						{ ! isSmallScreen && hasExcerpt && (
							<ReaderPostEllipsisMenu
								site={ site }
								teams={ teams }
								post={ post }
								showFollow
								openSuggestedFollows={ openSuggestedFollows }
							/>
						) }
						<FeaturedAsset
							post={ post }
							canonicalMedia={ post.canonical_media }
							postUrl={ post.URL }
							onVideoThumbnailClick={ onVideoThumbnailClick }
							isVideoExpanded={ isExpanded }
							isCompactPost
							hasExcerpt={ hasExcerpt }
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
	openSuggestedFollows: PropTypes.func,
};

export default CompactPost;
