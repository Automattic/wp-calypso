import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type {
	PostLikeMutationParams,
	PostLikeMutationResponse,
	PostLikesResponse,
	RawPostLikeMutationResponse,
	RawPostLikesResponse,
} from './types';

const postLikesPath = ( siteId: number, postId: number ) =>
	`/sites/${ encodeURIComponent( siteId ) }/posts/${ encodeURIComponent( postId ) }/likes`;

const postLikesMutationPath = ( path: string, source?: string ) =>
	source ? addQueryArgs( path, { source } ) : path;

const normalizePostLikesResponse = ( response: RawPostLikesResponse ): PostLikesResponse => ( {
	found: Number( response.found ?? 0 ),
	iLike: Boolean( response.i_like ),
	likes: response.likes ?? [],
} );

const normalizePostLikeMutationResponse = (
	response: RawPostLikeMutationResponse
): PostLikeMutationResponse => {
	if ( ! response.success ) {
		throw new Error( 'Unsuccessful post like API call' );
	}

	return {
		likeCount: Number( response.like_count ?? 0 ),
		liker: response.liker,
	};
};

export const fetchPostLikes = async (
	siteId: number,
	postId: number
): Promise< PostLikesResponse > => {
	const response = await wpcom.req.get( {
		path: postLikesPath( siteId, postId ),
		apiVersion: '1.1',
		method: 'GET',
	} );

	return normalizePostLikesResponse( response );
};

export const likePost = async ( {
	siteId,
	postId,
	source,
}: PostLikeMutationParams ): Promise< PostLikeMutationResponse > => {
	const response = await wpcom.req.post(
		{
			path: postLikesMutationPath( `${ postLikesPath( siteId, postId ) }/new`, source ),
			apiVersion: '1.1',
		},
		{}
	);

	return normalizePostLikeMutationResponse( response );
};

export const unlikePost = async ( {
	siteId,
	postId,
	source,
}: PostLikeMutationParams ): Promise< PostLikeMutationResponse > => {
	const response = await wpcom.req.post(
		{
			path: postLikesMutationPath( `${ postLikesPath( siteId, postId ) }/mine/delete`, source ),
			apiVersion: '1.1',
		},
		{}
	);

	return normalizePostLikeMutationResponse( response );
};
