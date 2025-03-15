import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState } from 'react';
import ReaderExcerpt from 'calypso/blocks/reader-excerpt';
import ReaderPostEllipsisMenu from 'calypso/blocks/reader-post-options-menu/reader-post-ellipsis-menu';
import AutoDirection from 'calypso/components/auto-direction';
import { ADD_NEW_TAB, REDDIT_TAB } from 'calypso/reader/discover/helper';
import ReaderFollowButton from 'calypso/reader/follow-button';
import { READER_DISCOVER } from 'calypso/reader/follow-sources';
import FeaturedAsset from './featured-asset';

/**
 * Rather than create complex logic to create context or pass props
 * to see if the user is on the Discover page, let's check the pathname
 */
const shouldShowFollowButton = () => {
	const path = window.location.pathname.split( '/' );
	if ( ! path.length ) {
		return false;
	}

	// Do not show if the user is not on the discover page.
	if ( path[ 1 ] !== 'discover' ) {
		return false;
	}

	// Do not show for feed previews available on the "Add New" and "Reddit" tab.
	if ( [ ADD_NEW_TAB, REDDIT_TAB ].includes( path[ 2 ] ) ) {
		return false;
	}

	return true;
};

const CompactPost = ( props ) => {
	const {
		children,
		post,
		expandCard,
		postKey,
		isExpanded,
		site,
		postByline,
		teams,
		openSuggestedFollows,
	} = props;

	const translate = useTranslate();

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

	const postOptions = (
		<div className="reader-post-card__post-options">
			{ shouldShowFollowButton() && (
				<ReaderFollowButton
					tagName="div"
					siteUrl={ post.feed_URL || post.site_URL }
					followSource={ READER_DISCOVER }
					iconSize={ 20 }
					followingLabel={ translate( 'Unsubscribe' ) }
				/>
			) }
			<ReaderPostEllipsisMenu
				site={ site }
				teams={ teams }
				post={ post }
				showFollow
				openSuggestedFollows={ openSuggestedFollows }
			/>
		</div>
	);

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
						{ ( imagePostWithoutExcerpt || ! post.canonical_media || isSmallScreen ) &&
							postOptions }
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
						{ ! isSmallScreen && hasExcerpt && postOptions }
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
