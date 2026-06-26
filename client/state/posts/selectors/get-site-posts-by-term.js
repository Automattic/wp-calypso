import { filter } from 'lodash';
import { getSitePosts } from 'calypso/state/posts/selectors/get-site-posts';

import 'calypso/state/posts/init';

export function getSitePostsByTerm( state, siteId, taxonomy, termId ) {
	return filter( getSitePosts( state, siteId ), ( post ) => {
		return (
			post.terms &&
			post.terms[ taxonomy ] &&
			Object.values( post.terms[ taxonomy ] ).find( ( postTerm ) => postTerm.ID === termId )
		);
	} );
}
