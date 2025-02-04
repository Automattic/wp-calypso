import { useMutation, UseMutationResult, useQuery, UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import wp from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { updatePreflightTests } from './actions';
import { getPreflightStatus } from './selectors';
import { PreflightTestStatus } from './types';

/**
 * Custom hook to query the status of a preflight check for a specific site.
 * Uses React Query's useQuery hook to periodically fetch the preflight status
 * and update the Redux store with the latest status.
 * @param {number} siteId - The ID of the site for which the preflight status is to be queried.
 * @returns {UseQueryResult} - The result object from React Query's useQuery hook.
 */
export const usePreflightStatusQuery = ( siteId: number, enabled = false ): UseQueryResult => {
	const dispatch = useDispatch();

	const preflightStatus = useSelector( ( state ) => getPreflightStatus( state, siteId ) );

	const shouldFetch =
		enabled &&
		preflightStatus !== PreflightTestStatus.SUCCESS &&
		preflightStatus !== PreflightTestStatus.FAILED;

	const query = useQuery( {
		queryKey: [ 'rewind', 'prefligh-status', siteId ],
		queryFn: async () => {
			return wp.req.get( {
				path: `/sites/${ siteId }/rewind/preflight`,
				apiNamespace: 'wpcom/v2',
			} );
		},
		enabled: shouldFetch,
		refetchInterval: 5000,
	} );

	useEffect( () => {
		if ( query.isSuccess && query.data?.ok ) {
			dispatch( updatePreflightTests( siteId, query.data?.status ) );
		}
	}, [ dispatch, query.data, query.isSuccess, siteId ] );

	return query;
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
