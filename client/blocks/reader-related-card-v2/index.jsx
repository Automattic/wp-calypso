/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { noop, partial } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { getPost } from 'state/reader/posts/selectors';
import { getSite } from 'state/reader/sites/selectors';
import QueryReaderSite from 'components/data/query-reader-site';
import Card from 'components/card/compact';
import Gravatar from 'components/gravatar';
import FollowButton from 'reader/follow-button';
import { getPostUrl, getStreamUrl } from 'reader/route';
import { areEqualIgnoringWhitespaceAndCase } from 'lib/string';
import ReaderFeaturedVideo from 'blocks/reader-featured-video';
import ReaderFeaturedImage from 'blocks/reader-featured-image';

const RELATED_IMAGE_WIDTH = 385; // usual width of featured images in related post card

function AuthorAndSiteFollow( { post, site, onSiteClick, followSource } ) {
	const siteUrl = getStreamUrl( post.feed_ID, post.site_ID );
	const siteName = ( site && site.title ) || post.site_name;
	const authorAndSiteAreDifferent = ! areEqualIgnoringWhitespaceAndCase( siteName, post.author.name );

	return (
		<div className="reader-related-card-v2__meta">
			<a href={ siteUrl } onClick={ onSiteClick }>
				<Gravatar user={ post.author } />
			</a>
			<div className="reader-related-card-v2__byline">
				{ authorAndSiteAreDifferent &&
				<span className="reader-related-card-v2__byline-author">
					<a href={ siteUrl } onClick={ onSiteClick } className="reader-related-card-v2__link">{ post.author.name }</a>
				</span>
				}
				<span className="reader-related-card-v2__byline-site">
					<a href={ siteUrl } onClick={ onSiteClick } className="reader-related-card-v2__link">{ siteName }</a>
				</span>
			</div>
			<FollowButton siteUrl={ post.site_URL } followSource={ followSource } railcar={ post.railcar } />
		</div>
	);
}

function AuthorAndSiteFollowPlaceholder() {
	return (
		<div className="reader-related-card-v2__meta is-placeholder">
			<Gravatar user={ null } />
			<div className="reader-related-card-v2__byline">
				<span className="reader-related-card-v2__byline-author">
					Author name
				</span>
				<span className="reader-related-card-v2__byline-site">
					Site title
				</span>
			</div>
		</div>
	);
}

function RelatedPostCardPlaceholder() {
	return (
		<Card className="reader-related-card-v2 is-placeholder">
			<AuthorAndSiteFollowPlaceholder />
			<a className="reader-related-card-v2__post reader-related-card-v2__link-block">
				<div className="reader-related-card-v2__featured-image"></div>
				<div className="reader-related-card-v2__site-info">
					<h1 className="reader-related-card-v2__title">Title</h1>
					<div className="reader-related-card-v2__excerpt post-excerpt">Excerpt</div>
				</div>
			</a>
		</Card>
	);
}

export function RelatedPostCard( { post, site, siteId, onPostClick = noop, onSiteClick = noop,
		followSource } ) {
	if ( ! post || post._state === 'minimal' || post._state === 'pending' ) {
		return <RelatedPostCardPlaceholder />;
	}

	const featuredImage = post.canonical_image;
	const postLink = getPostUrl( post );
	const classes = classnames( 'reader-related-card-v2', {
		'has-thumbnail': !! featuredImage,
		'has-excerpt': post.excerpt && post.excerpt.length > 1
	} );
	const postClickTracker = partial( onPostClick, post );
	const siteClickTracker = partial( onSiteClick, post );

	const canonicalMedia = post.canonical_media;
	let featuredAsset;
	if ( ! canonicalMedia ) {
		featuredAsset = null;
	} else if ( canonicalMedia.mediaType === 'video' ) {
		featuredAsset = <ReaderFeaturedVideo
			{ ...canonicalMedia }
			videoEmbed={ canonicalMedia }
			className={ 'reader-related-card-v2__featured-image' }
			href={ postLink }
			onThumbnailClick={ postClickTracker }
			allowPlaying={ false }
		/>;
	} else {
		featuredAsset = <ReaderFeaturedImage
			imageUrl={ canonicalMedia.src }
			imageWidth={ RELATED_IMAGE_WIDTH }
			onClick={ postClickTracker }
			href={ postLink }
			className={ 'reader-related-card-v2__featured-image' }
		/>;
	}

	return (
		<Card className={ classes }>
			{ siteId && ! site && <QueryReaderSite siteId={ siteId } /> }
			<AuthorAndSiteFollow post={ post } site={ site } onSiteClick={ siteClickTracker } followSource={ followSource } />
			{ featuredAsset }
			<a href={ postLink } className="reader-related-card-v2__post reader-related-card-v2__link-block"
				onClick={ postClickTracker } >
				<div className="reader-related-card-v2__site-info">
					<h1 className="reader-related-card-v2__title">{ post.title }</h1>
					<div className="reader-related-card-v2__excerpt post-excerpt">
						{ featuredImage ? post.short_excerpt : post.better_excerpt_no_html }
					</div>
				</div>
			</a>
		</Card>
	);
}

export const LocalizedRelatedPostCard = localize( RelatedPostCard );

export default connect(
	( state, ownProps ) => {
		const { post } = ownProps;
		const actualPost = getPost( state, post );
		const siteId = post && post.site_ID;
		const site = siteId && getSite( state, siteId );
		return {
			post: actualPost,
			site,
			siteId
		};
	}
)( LocalizedRelatedPostCard );
