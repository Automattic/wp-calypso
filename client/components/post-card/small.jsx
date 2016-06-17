/**
 * External Dependencies
 */
import React from 'react';
import classnames from 'classnames';
import noop from 'lodash/noop';
import partial from 'lodash/partial';

/**
 * Internal Dependencies
 */
import Card from 'components/card/compact';
import SiteIcon from 'components/site-icon';
import safeImageUrl from 'lib/safe-image-url';
import resizeImageUrl from 'lib/resize-image-url';

export default function SmallPostCard( { post, site, onPostClick = noop, onSiteClick = noop } ) {
	const classes = classnames( 'post-card small', {
		'has-image': post.canonical_image
	} );
	return (
		<Card className={ classes }>
			<div className="post-card__site-info-title">
				<a className="post-card__site-info" href={ `/read/blogs/${post.site_ID}` } onClick={ partial( onSiteClick, site, post ) }>
					<SiteIcon site={ site } size={ 16 } />
					<span className="post-card__site-title">{ site && site.title || post.site_name }</span>
				</a>
				<h1 className="post-card__title">
					<a className="post-card__anchor" href={ `/read/blogs/${post.site_ID}/posts/${post.ID}` } onClick={ partial( onPostClick, post ) }>{ post.title }</a>
				</h1>
			</div>
			<div>
			{ post.canonical_image && (
					<a href={ `/read/blogs/${post.site_ID}/posts/${post.ID}` } onClick={ partial( onPostClick, post ) }><img className="post-card__thumbnail" src={ resizeImageUrl( safeImageUrl( post.canonical_image.uri ), { resize: '96,72' } ) } /></a> ) }
			</div>
		</Card>
	);
}
