import { getSitePosts } from 'calypso/state/posts/selectors/get-site-posts';

import 'calypso/state/posts/init';

export function getSitePostsByTerm( state, siteId, taxonomy, termId ) {
	return ( getSitePosts( state, siteId ) ?? [] ).filter( ( post ) => {
		return (
			post.terms &&
			post.terms[ taxonomy ] &&
			Object.values( post.terms[ taxonomy ] ).find( ( postTerm ) => postTerm.ID === termId )
		);
	} );
}
