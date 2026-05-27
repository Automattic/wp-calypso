import { siteCommentsInfiniteQuery } from '@automattic/api-queries';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { isCommentsApiDisabledError, setCommentsApiDisabled } from './api-disabled';

type UsePostCommentsQueryParams = {
	siteId?: number;
	postId?: number;
	status?: string;
	number?: number;
};

export type UseCommentsOptions = {
	enabled?: boolean;
	retry?: boolean | number;
};

export const usePostCommentsQuery = (
	{ siteId, postId, status = 'approved', number }: UsePostCommentsQueryParams,
	{ enabled = true, retry = false }: UseCommentsOptions = {}
) => {
	const queryClient = useQueryClient();
	const queryOptions = siteCommentsInfiniteQuery( {
		siteId: siteId ?? 0,
		postId: postId ?? 0,
		status,
		number,
	} );

	return useInfiniteQuery( {
		...queryOptions,
		queryFn: async ( context ) => {
			try {
				return await queryOptions.queryFn!( context );
			} catch ( error ) {
				if ( siteId && isCommentsApiDisabledError( error ) ) {
					setCommentsApiDisabled( queryClient, siteId );
				}
				throw error;
			}
		},
		enabled: Boolean( enabled && siteId && postId ),
		retry,
	} );
};
