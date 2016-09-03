/**
 * External Dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import noop from 'lodash/noop';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { getPost } from 'state/reader/posts/selectors';
import { getSite } from 'state/reader/sites/selectors';
import Card from 'components/card/compact';
import Gravatar from 'components/gravatar';
import FollowButton from 'reader/follow-button';

function FeaturedImage( { image, href } ) {
	return (
		<div className="reader-related-card-v2__featured-image" href={ href } style={ {
			backgroundImage: 'url(' + image.uri + ')',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: '50% 50%'
		} } ></div> );
}

function AuthorAndSiteFollow( { post, site } ) {
	return (
		<div className="reader-related-card-v2__meta">
			<Gravatar user={ post.author } />
			<div className="reader-related-card-v2__byline">
				<span className="reader-related-card-v2__byline-author">
					<a href="#" className="reader-related-card-v2__link">{ post.author.name }</a>
				</span>
				<span className="reader-related-card-v2__byline-site">
					<a href="#" className="reader-related-card-v2__link">{ site.title }</a>
				</span>
			</div>
			<FollowButton siteUrl={ post.site_URL } />
		</div>
	);
}

/* eslint-disable no-unused-vars */
export function RelatedPostCard( { post, site, onPostClick = noop, onSiteClick = noop } ) {
// onSiteClick is not being used
/* eslint-enable no-unused-vars */
	const featuredImage = post.canonical_image;
	const classes = classnames( 'reader-related-card-v2' );

	return (
		<Card className={ classes }>
			<AuthorAndSiteFollow post={ post } site={ site } />
			<a href={ post.URL } className="reader-related-card-v2__link-block">
			{ featuredImage && <FeaturedImage image={ featuredImage } href={ post.URL } /> }
			<div className="reader-related-card-v2__site-info">
				<h1 className="reader-related-card-v2__title">{ post.title }</h1>
				<div className="reader-related-card-v2__excerpt">{ post.short_excerpt }</div>
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
		const site = actualPost && getSite( state, actualPost.site_ID );
		return {
			post: actualPost,
			site
		};
	}
)( LocalizedRelatedPostCard );
