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
import safeImageUrl from 'lib/safe-image-url';
import resizeImageUrl from 'lib/resize-image-url';
import AuthorAndSite from 'blocks/reader-author-and-site';

/* eslint-disable no-unused-vars */
export function SmallPostCard( { post, site, onPostClick = noop, onSiteClick = noop } ) {
// onSiteClick is not being used
/* eslint-enable no-unused-vars */
	const classes = classnames( 'reader-related-card', {
		'has-image': post.canonical_image
	} );

	const thumbnailUrl = post.canonical_image && resizeImageUrl( safeImageUrl( post.canonical_image.uri ), { resize: '96,72' } );

	return (
		<Card className={ classes }>
			<div className="reader-related-card__site-info-title">
				<h1 className="reader-related-card__title">
					<a className="reader-related-card__anchor" href={ `/read/blogs/${post.site_ID}/posts/${post.ID}` } onClick={ partial( onPostClick, post ) }>{ post.title }</a>
				</h1>
				<div className="reader-related-card__site-info">
					<AuthorAndSite post={ post } site={ site } />
				</div>
			</div>
			<div>
			{ post.canonical_image && (
					<a href={ `/read/blogs/${post.site_ID}/posts/${post.ID}` } onClick={ partial( onPostClick, post ) }>
						<img className="reader-related-card__thumbnail" src={ thumbnailUrl } />
					</a> ) }
			</div>
		</Card>
	);
}

export default localize( SmallPostCard );
