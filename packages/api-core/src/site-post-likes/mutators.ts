import { wpcom } from '../wpcom-fetcher';
import type { PostLiker } from './types';

interface RawLikeResponse {
	success: boolean;
	like_count: number;
	liker: PostLiker;
}

export interface PostLikeMutationResponse {
	likeCount: number;
	liker: PostLiker;
}

function fromApi( response: RawLikeResponse ): PostLikeMutationResponse {
	if ( ! response.success ) {
		throw new Error( 'Unsuccessful post like API call' );
	}
	return {
		likeCount: +response.like_count,
		liker: response.liker,
	};
}

export function likePost(
	siteId: number,
	postId: number,
	source?: string
): Promise< PostLikeMutationResponse > {
	return wpcom.req
		.post( {
			path: `/sites/${ siteId }/posts/${ postId }/likes/new`,
			apiVersion: '1.1',
			body: {},
			query: source ? { source } : undefined,
		} )
		.then( fromApi );
}

export function unlikePost(
	siteId: number,
	postId: number,
	source?: string
): Promise< PostLikeMutationResponse > {
	return wpcom.req
		.post( {
			path: `/sites/${ siteId }/posts/${ postId }/likes/mine/delete`,
			apiVersion: '1.1',
			body: {},
			query: source ? { source } : undefined,
		} )
		.then( fromApi );
}
