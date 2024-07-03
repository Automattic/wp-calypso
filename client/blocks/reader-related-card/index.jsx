import { CompactCard as Card } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import { useState } from 'react';
import { connect } from 'react-redux';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import ReaderFeaturedVideo from 'calypso/blocks/reader-featured-video';
import ReaderPostOptionsMenu from 'calypso/blocks/reader-post-options-menu';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import Gravatar from 'calypso/components/gravatar';
import { areEqualIgnoringWhitespaceAndCase } from 'calypso/lib/string';
import { getPostUrl, getStreamUrl } from 'calypso/reader/route';
import { getPostById } from 'calypso/state/reader/posts/selectors';
import { getSite } from 'calypso/state/reader/sites/selectors';

import './style.scss';

const noop = () => {};

function AuthorAndSiteFollow( { post, site, onSiteClick, followSource, onFollowToggle } ) {
	const siteUrl = getStreamUrl( post.feed_ID, post.site_ID );
	const siteName = ( site && site.title ) || post.site_name;
	const authorName = get( post, 'author.name', '' );
	const authorAndSiteAreDifferent = ! areEqualIgnoringWhitespaceAndCase( siteName, authorName );

	return (
		<div className="reader-related-card__meta">
			<a href={ siteUrl } onClick={ onSiteClick } aria-hidden="true">
				<Gravatar user={ post.author } />
			</a>
			<div className="reader-related-card__byline">
				<span className="reader-related-card__byline-site">
					<a href={ siteUrl } onClick={ onSiteClick } className="reader-related-card__link">
						{ siteName }
					</a>
				</span>
				{ authorName && authorAndSiteAreDifferent && (
					<span className="reader-related-card__byline-author">
						<ReaderAuthorLink
							author={ post.author }
							siteUrl={ siteUrl }
							post={ post }
							onClick={ onSiteClick }
							className="reader-related-card__link"
						>
							{ authorName }
						</ReaderAuthorLink>
					</span>
				) }
			</div>
			<ReaderPostOptionsMenu
				showFollow
				showConversationFollow
				showVisitPost
				showEditPost={ false }
				showReportSite
				showReportPost
				openSuggestedFollows={ onFollowToggle }
				followSource={ followSource }
				post={ post }
			/>
		</div>
	);
}

function AuthorAndSiteFollowPlaceholder() {
	return (
		<div className="reader-related-card__meta is-placeholder">
			<Gravatar user={ null } />
			<div className="reader-related-card__byline">
				<span className="reader-related-card__byline-author">Author name</span>
				<span className="reader-related-card__byline-site">Site title</span>
			</div>
		</div>
	);
}

function RelatedPostCardPlaceholder() {
	return (
		/* eslint-disable */
		<Card className="reader-related-card is-placeholder">
			<AuthorAndSiteFollowPlaceholder />
			<a className="reader-related-card__post reader-related-card__link-block">
				<div className="reader-related-card__featured-image" />
				<div className="reader-related-card__site-info">
					<h1 className="reader-related-card__title">Title</h1>
					<div className="reader-related-card__excerpt post-excerpt">Excerpt</div>
				</div>
			</a>
		</Card>
		/* eslint-enable */
	);
}

export function RelatedPostCard( {
	post,
	site,
	siteId,
	onPostClick = noop,
	onSiteClick = noop,
	followSource,
} ) {
	const [ isSuggestedFollowsModalOpen, setIsSuggestedFollowsModalOpen ] = useState( false );
	if ( ! post || post._state === 'minimal' || post._state === 'pending' ) {
		return <RelatedPostCardPlaceholder />;
	}

	const openSuggestedFollowsModal = ( followClicked ) => {
		setIsSuggestedFollowsModalOpen( followClicked );
	};

	const onCloseSuggestedFollowModal = () => {
		setIsSuggestedFollowsModalOpen( false );
	};

	const postLink = getPostUrl( post );
	const classes = clsx( 'reader-related-card', {
		'has-thumbnail': !! post.canonical_media,
		'has-excerpt': post.excerpt && post.excerpt.length > 1,
	} );
	const postClickTracker = () => onPostClick( post );
	const siteClickTracker = () => onSiteClick( post );

	const canonicalMedia = post.canonical_media;
	let featuredAsset;
	if ( ! canonicalMedia ) {
		featuredAsset = null;
	} else if ( canonicalMedia.mediaType === 'video' ) {
		featuredAsset = (
			<ReaderFeaturedVideo
				{ ...canonicalMedia }
				videoEmbed={ canonicalMedia }
				className="reader-related-card__featured-image"
				href={ postLink }
				onThumbnailClick={ postClickTracker }
				allowPlaying={ false }
			/>
		);
	} else {
		featuredAsset = (
			<ReaderFeaturedImage
				canonicalMedia={ canonicalMedia }
				imageUrl={ canonicalMedia.src }
				onClick={ postClickTracker }
				href={ postLink }
				className="reader-related-card__featured-image"
				children={ <div style={ { width: 'auto' } } /> }
			/>
		);
	}

	return (
		<Card className={ classes }>
			{ siteId && ! site && <QueryReaderSite siteId={ siteId } /> }
			<AuthorAndSiteFollow
				post={ post }
				site={ site }
				onSiteClick={ siteClickTracker }
				followSource={ followSource }
				onFollowToggle={ openSuggestedFollowsModal }
			/>
			{ featuredAsset }
			<a
				href={ postLink }
				className="reader-related-card__post reader-related-card__link-block"
				onClick={ postClickTracker }
			>
				<div className="reader-related-card__site-info">
					<h1 className="reader-related-card__title">{ post.title }</h1>
					<div className="reader-related-card__excerpt post-excerpt">
						{ post.canonical_media ? post.short_excerpt : post.better_excerpt_no_html }
					</div>
				</div>
			</a>
			{ post.site_ID && (
				<ReaderSuggestedFollowsDialog
					onClose={ onCloseSuggestedFollowModal }
					siteId={ +post.site_ID }
					isVisible={ isSuggestedFollowsModalOpen }
				/>
			) }
		</Card>
	);
}

export const LocalizedRelatedPostCard = localize( RelatedPostCard );

export default connect( ( state, ownProps ) => {
	const { post } = ownProps;
	const actualPost = getPostById( state, post );
	const siteId = post && post.site_ID;
	const site = siteId && getSite( state, siteId );
	return {
		post: actualPost,
		site,
		siteId,
	};
} )( LocalizedRelatedPostCard );
