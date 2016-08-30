/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import noop from 'lodash/noop';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'components/card/compact';
import Gravatar from 'components/gravatar';
import FollowButton from 'components/follow-button/button';

function FeaturedImage( { image, href } ) {
	return (
		<div className="reader-related-card-v2__featured-image" href={ href } style={ {
			backgroundImage: 'url(' + image.uri + ')',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: '50% 50%'
		} } ></div> );
}

function AuthorAndSiteFollow( { post } ) {
	return (
		<div className="reader-related-card-v2__meta">
			<Gravatar user={ post.author } />
			<div className="reader-related-card-v2__byline">
				<span className="reader-related-card-v2__byline-author"><a href="#" className="reader-related-card-v2__link">Steve Stevenson</a></span>
				<span className="reader-related-card-v2__byline-site"><a href="#" className="reader-related-card-v2__link">steve.wordpress.com</a></span>
			</div>
			<FollowButton following={ false } />
		</div>
	);
}

/* eslint-disable no-unused-vars */
export function SmallPostCard( { post, site, onPostClick = noop, onSiteClick = noop } ) {
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

export default localize( SmallPostCard );
