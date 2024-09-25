import { useQuery, useQueries, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

interface ConnectionInfo {
	isRegistered: boolean;
	isUserConnected: boolean;
}

function queryJetpackConnectionStatus( siteId: number | null ): Promise< ConnectionInfo > {
	return wpcom.req.get( {
		apiNamespace: 'jetpack/v4',
		path: `/connection`,
	} );
}

export function useJetpackConnectionStatus( siteId: number | null ) {
	return useQuery( {
		...getDefaultQueryParams< ConnectionInfo >(),
		queryKey: [ 'stats', 'jetpack-connnection-status', siteId ],
		queryFn: () => queryJetpackConnectionStatus( siteId ),
		select: ( data ) => ( {
			...data,
			isSiteFullyConnected: ! data.isRegistered || ! data.isUserConnected,
		} ),
		staleTime: 1000 * 60 * 5, // 5 minutes
	} );
}
