/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import noop from 'lodash/noop';
import partial from 'lodash/partial';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Card from 'components/card/compact';

function FeaturedImage( { image, href } ) {
	return (
		<a className="reader-related-card-v2__featured-image" href={ href } style={ {
			backgroundImage: 'url(' + image.uri + ')',
			backgroundSize: 'cover',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: '50% 50%'
		} } ></a> );
}

/* eslint-disable no-unused-vars */
export function SmallPostCard( { post, site, onPostClick = noop, onSiteClick = noop } ) {
// onSiteClick is not being used
/* eslint-enable no-unused-vars */
	const featuredImage = post.canonical_image;
	const classes = classnames( 'reader-related-card-v2' );

	return (
		<Card className={ classes }>
			{ featuredImage && <FeaturedImage image={ featuredImage } href={ post.URL } /> }
			<div className="reader-related-card-v2__site-info">
				<h1 className="reader-related-card-v2__title">
					<a className="reader-related-card-v2__link" href={ `/read/blogs/${post.site_ID}/posts/${post.ID}` } onClick={ partial( onPostClick, post ) }>{ post.title }</a>
				</h1>
				<div className="reader-related-card-v2__excerpt">{ post.short_excerpt }</div>
			</div>
		</Card>
	);
}

export default localize( SmallPostCard );
