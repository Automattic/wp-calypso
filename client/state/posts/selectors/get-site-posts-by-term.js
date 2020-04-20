/**
 * External dependencies
 */
import { filter, find } from 'lodash';

/**
 * Internal dependencies
 */
import { getSitePosts } from 'state/posts/selectors/get-site-posts';

import 'state/posts/init';

export function getSitePostsByTerm( state, siteId, taxonomy, termId ) {
	return filter( getSitePosts( state, siteId ), ( post ) => {
		return (
			post.terms &&
			post.terms[ taxonomy ] &&
			find( post.terms[ taxonomy ], ( postTerm ) => postTerm.ID === termId )
		);
	} );
}
