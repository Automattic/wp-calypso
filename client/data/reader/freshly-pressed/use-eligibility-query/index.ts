import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type ApiResponse = {
	eligible: boolean;
	details: {
		code: string;
		reason: string;
	} | null;
};

export type Response = ApiResponse & {
	/**
	 * The status of the post for freshly pressed
	 * @default null
	 */
	status: 'suggested' | 'published' | 'not-eligible' | 'eligible' | null;
};

const request = async ( blogId: number, postId: number ) => {
	return ( await wpcom.req.get( {
		path: `/freshly-pressed/eligibility/${ blogId }/${ postId }`,
		apiNamespace: 'wpcom/v2',
	} ) ) as unknown as ApiResponse;
};

export const getQueryKey = ( params: Params ) => {
	return [ 'freshly-pressed', 'eligibility', params.blogId, params.postId ];
};

const getStatus = ( data?: ApiResponse ): Response[ 'status' ] => {
	if ( data?.details?.code === 'post_already_suggested' ) {
		return 'suggested';
	}

	if ( data?.details?.code === 'post_already_freshly_pressed' ) {
		return 'published';
	}

	if ( data?.eligible === true ) {
		return 'eligible';
	}

	if ( data?.eligible === false ) {
		return 'not-eligible';
	}

	return null;
};

/**
 * Returns the query options for the suggestion query
 * Use it with useQueryVariations (e.g useSuspenseQuery or useInfiniteQuery)
 * @param params - The parameters for the query
 * @returns The query options for the eligibility query
 */
export const getQueryOptions = ( params: Params ) => {
	return {
		queryKey: getQueryKey( params ),
		queryFn: () => request( params.blogId!, params.postId! ),
		enabled: !! params.blogId && !! params.postId,
		select: ( data: ApiResponse ) => {
			return {
				...data,
				status: getStatus( data ),
			} as Response;
		},
	};
};

interface Params {
	blogId: number | undefined;
	postId: number | undefined;
}

/**
 * React query hook to get the eligibility of a post for freshly pressed
 * @param params - The parameters for the query
 * @returns The query options for the eligibility query
 */
export const useEligibilityQuery = ( params: Params ) => {
	return useQuery( getQueryOptions( params ) );
};
