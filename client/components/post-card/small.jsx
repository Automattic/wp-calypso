/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import noop from 'lodash/noop';
import partial from 'lodash/partial';
import { localize } from 'i18n-calypso';
import trim from 'lodash/trim';

/**
 * Internal Dependencies
 */
import Card from 'components/card/compact';
import safeImageUrl from 'lib/safe-image-url';
import resizeImageUrl from 'lib/resize-image-url';

export function SmallPostCard( { translate, post, site, onPostClick = noop, onSiteClick = noop } ) {
	const classes = classnames( 'post-card small', {
		'has-image': post.canonical_image
	} );
	const displayName = trim( `${post.author.first_name} ${post.author.last_name}` );

	return (
		<Card className={ classes }>
			<div className="post-card__site-info-title">
				<h1 className="post-card__title">
					<a className="post-card__anchor" href={ `/read/blogs/${post.site_ID}/posts/${post.ID}` } onClick={ partial( onPostClick, post ) }>{ post.title }</a>
				</h1>
				<div className="post-card__site-info">
					{ displayName && (
						<span className="post-card__author">
							<a href="href={ `/read/blogs/${post.site_ID}` } onClick={ partial( onSiteClick, site, post ) }">{ displayName }</a>
						</span> )
					}
					<span className="post-card__site-title">
						<a href="href={ `/read/blogs/${post.site_ID}` } onClick={ partial( onSiteClick, site, post ) }">{ site && site.title || post.site_name }
						</a>
					</span>
				</div>
			</div>
			<div>
			{ post.canonical_image && (
					<a href={ `/read/blogs/${post.site_ID}/posts/${post.ID}` } onClick={ partial( onPostClick, post ) }><img className="post-card__thumbnail" src={ resizeImageUrl( safeImageUrl( post.canonical_image.uri ), { resize: '96,72' } ) } /></a> ) }
			</div>
		</Card>
	);
}

export default localize( SmallPostCard );
