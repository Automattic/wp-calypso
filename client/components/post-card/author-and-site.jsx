/**
 * External Dependencies
 */
import React from 'react';
import partial from 'lodash/partial';
import noop from 'lodash/noop';
import { localize } from 'i18n-calypso';
import Immutable from 'immutable';

/**
 * Internal Dependencies
 */
import Gravatar from 'components/gravatar';

export function AuthorAndSite( { translate, post, site, feed, showGravatar = false, onClick = noop } ) {
	const displayName = post.author && post.author.name;
	if ( Immutable.Iterable.isIterable( site ) ) {
		site = site.toJS();
	}
	const siteName = site && site.title || post.site_name;

	const username = (
		<span className="post-card__search-byline-author">
			<a className="post-card__byline-link" href={ `/read/blogs/${post.site_ID}` } onClick={ partial( onClick, { post, site, feed } ) }>
				{ showGravatar && <Gravatar user={ post.author } size={ 16 } /> }
				{ displayName }
			</a>
		</span>
	);

	const sitename = ( <span className="post-card__byline-site">
		<a className="post-card__byline-link" href={ `/read/blogs/${post.site_ID}` } onClick={ partial( onClick, { post, site, feed } ) }>{ siteName }</a>
	</span> );
	return (
		<span className="post-card__byline-author-and-site">
			{
				displayName === '' || siteName === displayName
				? sitename
				: translate( '{{username/}}, {{sitename/}}', {
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
