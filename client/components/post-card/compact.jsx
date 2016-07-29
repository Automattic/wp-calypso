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
import AuthorAndSite from './author-and-site';

export function CompactPostCard( { translate, post, site, onPostClick = noop, onSiteClick = noop } ) {
	const classes = classnames( 'post-card__compact small', {
		'has-image': post.canonical_image
	} );
	const displayName = post.author.name;
	const siteName = site && site.title || post.site_name;

	const username = (
		<span className="post-card__compact-author">
			<a href={ `/read/blogs/${post.site_ID}` } onClick={ partial( onSiteClick, site, post ) }>{ displayName }</a>
		</span>
	);

	const sitename = ( <span className="post-card__compact-site-title">
		<a href={ `/read/blogs/${post.site_ID}` } onClick={ partial( onSiteClick, site, post ) }>{ siteName }</a>
	</span> );

	const thumbnailUrl = post.canonical_image && resizeImageUrl( safeImageUrl( post.canonical_image.uri ), { resize: '96,72' } );

	return (
		<Card className={ classes }>
			<div className="post-card__compact-site-info-title">
				<h1 className="post-card__compact-title">
					<a className="post-card__compact-anchor" href={ `/read/blogs/${post.site_ID}/posts/${post.ID}` } onClick={ partial( onPostClick, post ) }>{ post.title }</a>
				</h1>
				<div className="post-card__compact-site-info">
					<AuthorAndSite post={ post } site={ site } />
				</div>
			</div>
			<div>
			{ post.canonical_image && (
					<a href={ `/read/blogs/${post.site_ID}/posts/${post.ID}` } onClick={ partial( onPostClick, post ) }>
						<img className="post-card__compact-thumbnail" src={ thumbnailUrl } />
					</a> ) }
			</div>
		</Card>
	);
}

export default localize( CompactPostCard );
