import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import { updatePreflightTests } from './actions';
import { getPreflightStatus } from './selectors';
import { APIPreflightStatusResponse } from './types';

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
