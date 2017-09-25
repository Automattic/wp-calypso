/** @format */
/**
 * External dependencies
 */
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { get, noop, partial } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ReaderAuthorLink from 'blocks/reader-author-link';
import ReaderFeaturedImage from 'blocks/reader-featured-image';
import ReaderFeaturedVideo from 'blocks/reader-featured-video';
import Card from 'components/card/compact';
import QueryReaderSite from 'components/data/query-reader-site';
import Gravatar from 'components/gravatar';
import { areEqualIgnoringWhitespaceAndCase } from 'lib/string';
import FollowButton from 'reader/follow-button';
import { getPostUrl, getStreamUrl } from 'reader/route';
import { getPost } from 'state/reader/posts/selectors';
import { getSite } from 'state/reader/sites/selectors';

const RELATED_IMAGE_WIDTH = 385; // usual width of featured images in related post card

function AuthorAndSiteFollow( { post, site, onSiteClick, followSource } ) {
	const siteUrl = getStreamUrl( post.feed_ID, post.site_ID );
	const siteName = ( site && site.title ) || post.site_name;
	const authorName = get( post, 'author.name', '' );
	const authorAndSiteAreDifferent = ! areEqualIgnoringWhitespaceAndCase( siteName, authorName );

	return (
		<div className="reader-related-card-v2__meta">
			<a href={ siteUrl } onClick={ onSiteClick } aria-hidden="true">
				<Gravatar user={ post.author } />
			</a>
			<div className="reader-related-card-v2__byline">
				{ authorName &&
				authorAndSiteAreDifferent && (
					<span className="reader-related-card-v2__byline-author">
						<ReaderAuthorLink
							author={ post.author }
							siteUrl={ siteUrl }
							post={ post }
							onClick={ onSiteClick }
							className="reader-related-card-v2__link"
						>
							{ authorName }
						</ReaderAuthorLink>
					</span>
				) }
				<span className="reader-related-card-v2__byline-site">
					<a href={ siteUrl } onClick={ onSiteClick } className="reader-related-card-v2__link">
						{ siteName }
					</a>
				</span>
			</div>
			<FollowButton
				siteUrl={ post.site_URL }
				followSource={ followSource }
				railcar={ post.railcar }
			/>
		</div>
	);
}

function AuthorAndSiteFollowPlaceholder() {
	return (
		<div className="reader-related-card-v2__meta is-placeholder">
			<Gravatar user={ null } />
			<div className="reader-related-card-v2__byline">
				<span className="reader-related-card-v2__byline-author">Author name</span>
				<span className="reader-related-card-v2__byline-site">Site title</span>
			</div>
		</div>
	);
}

function RelatedPostCardPlaceholder() {
	return (
		<Card className="reader-related-card-v2 is-placeholder">
			<AuthorAndSiteFollowPlaceholder />
			<a className="reader-related-card-v2__post reader-related-card-v2__link-block">
				<div className="reader-related-card-v2__featured-image" />
				<div className="reader-related-card-v2__site-info">
					<h1 className="reader-related-card-v2__title">Title</h1>
					<div className="reader-related-card-v2__excerpt post-excerpt">Excerpt</div>
				</div>
			</a>
		</Card>
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
	if ( ! post || post._state === 'minimal' || post._state === 'pending' ) {
		return <RelatedPostCardPlaceholder />;
	}

	const postLink = getPostUrl( post );
	const classes = classnames( 'reader-related-card-v2', {
		'has-thumbnail': !! post.canonical_media,
		'has-excerpt': post.excerpt && post.excerpt.length > 1,
	} );
	const postClickTracker = partial( onPostClick, post );
	const siteClickTracker = partial( onSiteClick, post );

	const canonicalMedia = post.canonical_media;
	let featuredAsset;
	if ( ! canonicalMedia ) {
		featuredAsset = null;
	} else if ( canonicalMedia.mediaType === 'video' ) {
		featuredAsset = (
			<ReaderFeaturedVideo
				{ ...canonicalMedia }
				videoEmbed={ canonicalMedia }
				className={ 'reader-related-card-v2__featured-image' }
				href={ postLink }
				onThumbnailClick={ postClickTracker }
				allowPlaying={ false }
			/>
		);
	} else {
		featuredAsset = (
			<ReaderFeaturedImage
				imageUrl={ canonicalMedia.src }
				imageWidth={ RELATED_IMAGE_WIDTH }
				onClick={ postClickTracker }
				href={ postLink }
				className={ 'reader-related-card-v2__featured-image' }
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
			/>
			{ featuredAsset }
			<a
				href={ postLink }
				className="reader-related-card-v2__post reader-related-card-v2__link-block"
				onClick={ postClickTracker }
			>
				<div className="reader-related-card-v2__site-info">
					<h1 className="reader-related-card-v2__title">{ post.title }</h1>
					<div className="reader-related-card-v2__excerpt post-excerpt">
						{ !! post.canonical_media ? post.short_excerpt : post.better_excerpt_no_html }
					</div>
				</div>
			</a>
		</Card>
	);
}

export const LocalizedRelatedPostCard = localize( RelatedPostCard );

export default connect( ( state, ownProps ) => {
	const { post } = ownProps;
	const actualPost = getPost( state, post );
	const siteId = post && post.site_ID;
	const site = siteId && getSite( state, siteId );
	return {
		post: actualPost,
		site,
		siteId,
	};
} )( LocalizedRelatedPostCard );
