import './style.scss';
import { CompactCard as Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { get } from 'lodash';
import { useState } from 'react';
import ReaderAuthorLink from 'calypso/blocks/reader-author-link';
import ReaderFeaturedImage from 'calypso/blocks/reader-featured-image';
import ReaderFeaturedVideo from 'calypso/blocks/reader-featured-video';
import ReaderPostOptionsMenu from 'calypso/blocks/reader-post-options-menu';
import ReaderSuggestedFollowsDialog from 'calypso/blocks/reader-suggested-follows/dialog';
import { SiteIcon } from 'calypso/blocks/site-icon';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import { areEqualIgnoringWhitespaceAndCase } from 'calypso/lib/string';
import { getPostUrl, getStreamUrl } from 'calypso/reader/route';

const noop = () => {};

function AuthorAndSiteFollow( { post, site, onSiteClick, followSource, onFollowToggle } ) {
	const siteUrl = getStreamUrl( post.feed_ID, post.site_ID );
	const siteName = ( site && site.title ) || post.site_name;
	const authorName = get( post, 'author.name', '' );
	const authorAndSiteAreDifferent = ! areEqualIgnoringWhitespaceAndCase( siteName, authorName );

	return (
		<div className="reader-related-card__meta">
			<SiteIcon
				iconUrl={ post?.site_icon?.img || post?.site_icon?.ico }
				href={ siteUrl }
				size={ 40 }
				onClick={ onSiteClick }
			/>
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
	const translate = useTranslate();
	return (
		<div className="reader-related-card__meta is-placeholder">
			<span className="reader-related-card__site-icon">{ translate( 'Site icon' ) }</span>
			<div className="reader-related-card__byline">
				<span className="reader-related-card__byline-author">{ translate( 'Author name' ) }</span>
				<span className="reader-related-card__byline-site">{ translate( 'Site title' ) }</span>
			</div>
		</div>
	);
}

function RelatedPostCardPlaceholder() {
	const translate = useTranslate();
	return (
		/* eslint-disable */
		<Card className="reader-related-card is-placeholder">
			<AuthorAndSiteFollowPlaceholder />
			<a className="reader-related-card__post reader-related-card__link-block">
				<div className="reader-related-card__featured-image" />
				<div className="reader-related-card__site-info">
					<h1 className="reader-related-card__title">{ translate( 'Title' ) }</h1>
					<div className="reader-related-card__excerpt post-excerpt">
						{ translate( 'Excerpt' ) }
					</div>
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
	const effectiveSiteId = siteId ?? post?.site_ID;
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
			{ effectiveSiteId && ! site && <QueryReaderSite siteId={ +effectiveSiteId } /> }
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

export default RelatedPostCard;
