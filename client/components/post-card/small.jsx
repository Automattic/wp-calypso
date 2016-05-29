/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import Card from 'components/card/compact';
import SiteIcon from 'components/site-icon';
import safeImageUrl from 'lib/safe-image-url';
import resizeImageUrl from 'lib/resize-image-url';

export default function SmallPostCard( { post, site } ) {
	return (
		<Card className="post-card small">
			<a className="post-card__site-info" href={ `/read/blogs/${post.site_ID}` }>
				<SiteIcon site={ site } size={ 16 } />
				<span className="post-card__site-title">{ site && site.title || post.site_name }</span>
			</a>
			<h3 className="post-card__title">
				<a className="post-card__anchor" href={ `/read/blogs/${post.site_ID}/posts/${post.ID}` }>{ post.title }</a>
				{ post.canonical_image && (
					<a href={ `/read/blogs/${post.site_ID}/posts/${post.ID}` }><img className="post-card__thumbnail" src={ resizeImageUrl( safeImageUrl( post.canonical_image.uri ), { resize: '96,72' } ) } /></a> ) }
			</h3>
		</Card>
	);
}
