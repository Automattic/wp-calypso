import { wpcom } from '../wpcom-fetcher';
import type {
	RawSiteCommentLikeMutationResponse,
	SiteCommentLikeMutationParams,
	SiteCommentLikeMutationResponse,
} from './types';

const commentPath = ( siteId: number, commentId: number | string ) =>
	`/sites/${ encodeURIComponent( siteId ) }/comments/${ encodeURIComponent( commentId ) }`;

const normalizeLikeMutationResponse = (
	response: RawSiteCommentLikeMutationResponse
): SiteCommentLikeMutationResponse => {
	if ( ! response.success ) {
		throw new Error( 'Unsuccessful site comment like API call' );
	}

	return {
		likeCount: Number( response.like_count ?? 0 ),
	};
};

export const likeSiteComment = async ( {
	siteId,
	commentId,
}: SiteCommentLikeMutationParams ): Promise< SiteCommentLikeMutationResponse > => {
	const response = await wpcom.req.post(
		{
			path: `${ commentPath( siteId, commentId ) }/likes/new`,
			apiVersion: '1.1',
		},
		{}
	);

	return normalizeLikeMutationResponse( response );
};

export const unlikeSiteComment = async ( {
	siteId,
	commentId,
}: SiteCommentLikeMutationParams ): Promise< SiteCommentLikeMutationResponse > => {
	const response = await wpcom.req.post(
		{
			path: `${ commentPath( siteId, commentId ) }/likes/mine/delete`,
			apiVersion: '1.1',
		},
		{}
	);

	return normalizeLikeMutationResponse( response );
};
