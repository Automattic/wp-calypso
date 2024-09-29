import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

interface ConnectionInfo {
	isRegistered: boolean;
	isUserConnected: boolean;
	isSiteFullyConnected?: boolean;
}

function queryJetpackConnectionStatus(): Promise< ConnectionInfo > {
	// The following code only runs on Jetpack self-hosted sites.
	return wpcom.req.get( {
		apiNamespace: 'jetpack/v4',
		path: `/connection`,
	} );
}

export function useJetpackConnectionStatus( siteId: number | null, isSimpleSites = false ) {
	return useQuery( {
		...getDefaultQueryParams< ConnectionInfo >(),
		queryKey: [ 'stats', 'jetpack-connnection-status', siteId, isSimpleSites ],
		queryFn: () => {
			if ( ! isSimpleSites ) {
				return queryJetpackConnectionStatus();
			}
			return { isRegistered: true, isUserConnected: true };
		},
		select: ( data ) => ( {
			...data,
			isSiteFullyConnected: data.isRegistered && data.isUserConnected,
		} ),
		staleTime: 1000 * 60 * 5, // 5 minutes
	} );
}
