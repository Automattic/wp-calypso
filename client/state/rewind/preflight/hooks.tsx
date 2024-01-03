import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { updatePreflightTests } from './actions';
import { getPreflightStatus } from './selectors';
import { APIPreflightStatusResponse } from './types';

/**
 * Custom hook to query the status of a preflight check for a specific site.
 * Uses React Query's useQuery hook to periodically fetch the preflight status
 * and update the Redux store with the latest status.
 * @param {number} siteId - The ID of the site for which the preflight status is to be queried.
 * @returns {UseQueryResult} - The result object from React Query's useQuery hook.
 */
export const usePreflightStatusQuery = ( siteId: number ): UseQueryResult => {
	const dispatch = useDispatch();

	const preflightStatus = useSelector( ( state ) => getPreflightStatus( state, siteId ) );

	const shouldFetch = () => {
		return preflightStatus !== 'success' && preflightStatus !== 'failed';
	};

	return useQuery( {
		queryKey: [ 'rewind', 'prefligh-status', siteId ],
		queryFn: async () => {
			return wp.req.get( {
				path: `/sites/${ siteId }/rewind/preflight`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: shouldFetch(),
		refetchInterval: 5000,
		onSuccess: ( data: APIPreflightStatusResponse ) => {
			if ( data.ok ) {
				dispatch( updatePreflightTests( siteId, data.status ) );
			}
		},
	} );
};

/**
 * Custom hook to enqueue a preflight check for a specific site.
 * This hook uses the useMutation hook from React Query to perform an asynchronous POST request.
 * @param {number} siteId - The ID of the site for which the preflight check is to be enqueued.
 * @returns {UseMutationResult} - The result object from React Query's useMutation hook.
 */
export const useEnqueuePreflightCheck = ( siteId: number ): UseMutationResult => {
	const dispatch = useDispatch();

	return useMutation( {
		mutationFn: async () => {
			dispatch( updatePreflightTests( siteId, [] ) );
			return wp.req.post(
				{
					path: `/sites/${ siteId }/rewind/preflight`,
					apiNamespace: 'wpcom/v2',
				},
				{}
			);
		},
	} );
};
