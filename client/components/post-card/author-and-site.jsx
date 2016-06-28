/**
 * External Dependencies
 */
import React from 'react';
import partial from 'lodash/partial';
import noop from 'lodash/noop';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import Gravatar from 'components/gravatar';

export function AuthorAndSite( { translate, post, site, feed, showGravatar = false, onClick = noop } ) {
	const displayName = post.author && post.author.name;
	const siteName = site && site.title || post.site_name;

	const username = (
		<span className="post-card__author-and-site-author">
			{ showGravatar && <Gravatar user={ post.author } size={ 24 } /> }
			<a href={ `/read/blogs/${post.site_ID}` } onClick={ partial( onClick, { post, site, feed } ) }>{ displayName }</a>
		</span>
	);

	const sitename = ( <span className="post-card__author-and-site-site">
		<a href={ `/read/blogs/${post.site_ID}` } onClick={ partial( onClick, { post, site, feed } ) }>{ siteName }</a>
	</span> );
	return (
		<span className="post-card__author-and-site">
			{
				displayName === '' || siteName === displayName
				? translate( 'On {{sitename/}}', {
					components: {
						sitename
					}
				} )
				: translate( 'By {{username/}}, {{sitename/}}', {
					components: {
						username,
						sitename
					}
				} )
		}
		</span>
	);
}

export default localize( AuthorAndSite );
