import { wpcom } from '../wpcom-fetcher';
import type { ReadNewBlogs, ReadNewBlogsApiResponse } from './types';

/**
 * Fetch the current user's out-of-network recs from the wpcom/v2
 * `GET /reader/new-blogs` endpoint, mapped to camelCase.
 */
export async function fetchReadNewBlogs(): Promise< ReadNewBlogs > {
	const response: ReadNewBlogsApiResponse = await wpcom.req.get( {
		path: '/reader/new-blogs',
		apiNamespace: 'wpcom/v2',
	} );

	const recs = Array.isArray( response?.recs ) ? response.recs : [];
	return {
		updated: response?.updated ?? null,
		recs: recs.map( ( rec ) => ( {
			blogId: Number( rec.blog_id ),
			postId: Number( rec.post_id ),
			score: Number( rec.score ),
		} ) ),
	};
}
