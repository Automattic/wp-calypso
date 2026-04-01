import { wpcom } from '../wpcom-fetcher';
import type { PostLikesResponse } from './types';

interface RawPostLikesResponse {
	found: number | string;
	i_like: boolean;
	likes: PostLikesResponse[ 'likes' ];
}

export const fetchPostLikes = ( siteId: number, postId: number ): Promise< PostLikesResponse > => {
	return wpcom.req
		.get( {
			path: `/sites/${ siteId }/posts/${ postId }/likes`,
			apiVersion: '1.1',
		} )
		.then( ( data: RawPostLikesResponse ) => ( {
			found: +data.found,
			iLike: !! data.i_like,
			likes: data.likes,
		} ) );
};
