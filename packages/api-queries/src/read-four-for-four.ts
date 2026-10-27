import {
	adaptReadFourForFourCandidate,
	fetchReadFourForFourCandidates,
	fetchReadFourForFourStatus,
	recordReadFourForFourProgress,
} from '@automattic/api-core';
import { mutationOptions, queryOptions, type QueryClient } from '@tanstack/react-query';
import type {
	ReadFourForFourCandidatesResponse,
	ReadFourForFourProgressParams,
	ReadFourForFourStatusResponse,
} from '@automattic/api-core';

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const EMPTY_POOL_RETRY_MS = 15 * 1000;

export const getReadFourForFourStatusQueryKey = () =>
	[ 'read', 'four-for-four', 'status' ] as const;

const selectCandidates = ( data: ReadFourForFourCandidatesResponse ) =>
	data.candidates.map( adaptReadFourForFourCandidate );

export const readFourForFourCandidatesQuery = () =>
	queryOptions( {
		queryKey: [ 'read', 'four-for-four', 'candidates' ] as const,
		queryFn: fetchReadFourForFourCandidates,
		select: selectCandidates,
		staleTime: FIVE_MINUTES_MS,
		// An empty pool is usually transient: the server returns [] while it
		// rebuilds its cache. Keep checking while the user is on the page.
		refetchInterval: ( query ) =>
			query.state.data?.candidates.length === 0 ? EMPTY_POOL_RETRY_MS : false,
		meta: { persist: false },
		refetchOnWindowFocus: false,
	} );

export const readFourForFourStatusQuery = () =>
	queryOptions( {
		queryKey: getReadFourForFourStatusQueryKey(),
		queryFn: fetchReadFourForFourStatus,
		staleTime: FIVE_MINUTES_MS,
		meta: { persist: false },
	} );

type ProgressMutationContext = {
	previousStatus?: ReadFourForFourStatusResponse;
};

/**
 * Records candidate follows against the user's program status. The status
 * cache is patched optimistically so the progress meter moves with the click,
 * then replaced with the server's answer, which owns the `completed` flip.
 */
export const recordReadFourForFourProgressMutation = ( queryClient: QueryClient ) =>
	mutationOptions<
		ReadFourForFourStatusResponse,
		Error,
		ReadFourForFourProgressParams,
		ProgressMutationContext
	>( {
		meta: { statId: 'read-four-for-four-progress' },
		mutationFn: recordReadFourForFourProgress,
		retry: 2,
		onMutate: async ( { blog_ids } ) => {
			const queryKey = getReadFourForFourStatusQueryKey();
			await queryClient.cancelQueries( { queryKey } );
			const previousStatus = queryClient.getQueryData< ReadFourForFourStatusResponse >( queryKey );
			if ( previousStatus ) {
				queryClient.setQueryData< ReadFourForFourStatusResponse >( queryKey, {
					...previousStatus,
					followed_blog_ids: Array.from(
						new Set( [ ...previousStatus.followed_blog_ids, ...blog_ids ] )
					),
				} );
			}
			return { previousStatus };
		},
		onError: ( _error, _params, context ) => {
			if ( context?.previousStatus ) {
				queryClient.setQueryData( getReadFourForFourStatusQueryKey(), context.previousStatus );
			}
		},
		onSuccess: ( status ) => {
			queryClient.setQueryData( getReadFourForFourStatusQueryKey(), status );
		},
	} );
