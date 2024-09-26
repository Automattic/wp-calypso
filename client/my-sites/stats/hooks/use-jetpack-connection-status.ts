import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

interface ConnectionInfo {
	isRegistered: boolean;
	isUserConnected: boolean;
	isSiteFullyConnected?: boolean;
}

function queryJetpackConnectionStatus(
	siteId: number | null,
	isWpcomSite = false
): Promise< ConnectionInfo > {
	if ( isWpcomSite ) {
		return Promise.resolve( {
			isRegistered: true,
			isUserConnected: true,
		} );
	}

	return wpcom.req.get( {
		apiNamespace: 'jetpack/v4',
		path: `/connection`,
	} );
}

export function useJetpackConnectionStatus( siteId: number | null, isWpcomSite = false ) {
	return useQuery( {
		...getDefaultQueryParams< ConnectionInfo >(),
		queryKey: [ 'stats', 'jetpack-connnection-status', siteId, isWpcomSite ],
		queryFn: () => queryJetpackConnectionStatus( siteId, isWpcomSite ),
		select: ( data ) => ( {
			...data,
			isSiteFullyConnected: data.isRegistered && data.isUserConnected,
		} ),
		staleTime: 1000 * 60 * 5, // 5 minutes
	} );
}
