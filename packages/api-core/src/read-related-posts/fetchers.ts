import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import { SCOPE_ALL, SCOPE_OTHER, SCOPE_SAME } from './types';
import type { ReadRelatedPostsParams, ReadRelatedPostsResponse } from './types';

export const fetchReadRelatedPosts = ( {
	siteId,
	postId,
	scope = SCOPE_ALL,
	size = 2,
	contentWidth,
}: ReadRelatedPostsParams ): Promise< ReadRelatedPostsResponse > => {
	const query: Record< string, string | number | undefined > = { meta: 'site' };

	if ( contentWidth ) {
		query.content_width = contentWidth;
	}

	if ( scope === SCOPE_SAME ) {
		query.size_local = size;
		query.size_global = 0;
	} else if ( scope === SCOPE_OTHER ) {
		query.size_local = 0;
		query.size_global = size;
	}

	return wpcom.req.get( {
		path: addQueryArgs( `/read/site/${ siteId }/post/${ postId }/related`, query ),
		apiVersion: '1.2',
		method: 'GET',
	} );
};
