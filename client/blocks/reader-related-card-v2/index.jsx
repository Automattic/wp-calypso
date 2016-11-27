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
import Card from 'components/card/compact';
import Gravatar from 'components/gravatar';
import FollowButton from 'reader/follow-button';
import { getPostUrl, getStreamUrl } from 'reader/route';

function FeaturedImage( { image, href } ) {
	return (
		<div className="reader-related-card-v2__featured-image" href={ href } style={ {
			backgroundImage: 'url(' + image.uri + ')',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: '50% 50%'
		} } ></div> );
}

function AuthorAndSiteFollow( { post, onSiteClick } ) {
	const siteUrl = getStreamUrl( post.feed_ID, post.site_ID );
	const authorAndSiteAreDifferent = post.site_name.toLowerCase() !== post.author.name.toLowerCase();
	return (
		<div className="reader-related-card-v2__meta">
			<a href={ siteUrl } onClick={ onSiteClick }>
				<Gravatar user={ post.author } />
			</a>
			<div className="reader-related-card-v2__byline">
				<span className="reader-related-card-v2__byline-author">
					<a href={ siteUrl } onClick={ onSiteClick } className="reader-related-card-v2__link">{ post.author.name }</a>
				</span>
				{ authorAndSiteAreDifferent &&
				<span className="reader-related-card-v2__byline-site">
					<a href={ siteUrl } onClick={ onSiteClick } className="reader-related-card-v2__link">{ post.site_name }</a>
				</span>
				}
			</div>
			<FollowButton siteUrl={ post.site_URL } />
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

export function RelatedPostCard( { post, onPostClick = noop, onSiteClick = noop } ) {
/* eslint-enable no-unused-vars */
	if ( ! post || post._state === 'minimal' || post._state === 'pending' ) {
		return <RelatedPostCardPlaceholder />;
	}

	const featuredImage = post.canonical_image;
	const postLink = getPostUrl( post );
	const classes = classnames( 'reader-related-card-v2', {
		'has-thumbnail': !! featuredImage
	} );
	const postClickTracker = partial( onPostClick, post );
	const siteClickTracker = partial( onSiteClick, post );

	return (
		<Card className={ classes }>
			<AuthorAndSiteFollow post={ post } onSiteClick={ siteClickTracker } />
			<a href={ postLink } className="reader-related-card-v2__post reader-related-card-v2__link-block"
				onClick={ postClickTracker } >
					{ featuredImage && <FeaturedImage image={ featuredImage } href={ post.URL }
						onClick={ postClickTracker } /> }
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
		return {
			post: actualPost
		};
	}
)( LocalizedRelatedPostCard );
