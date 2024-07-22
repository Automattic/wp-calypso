import { useQuery, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export const getGetTipaltiPayeeQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-tipalti-payee', agencyId ];
};

export default function useGetTipaltiPayee( useStaleData = false ) {
	const agencyId = useSelector( getActiveAgencyId );

	const queryClient = useQueryClient();
	const data = queryClient.getQueryData( getGetTipaltiPayeeQueryKey( agencyId ) );

	let staleTime = 0;

	// If we have data and we want to use stale data, set the stale time to Infinity to prevent refetching.
	if ( useStaleData && data ) {
		staleTime = Infinity;
	}

	return useQuery( {
		queryKey: getGetTipaltiPayeeQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/tipalti`,
			} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		staleTime,
	} );
}
