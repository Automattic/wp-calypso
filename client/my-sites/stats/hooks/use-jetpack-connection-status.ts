import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import getDefaultQueryParams from './default-query-params';

const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

interface ConnectionInfo {
	isRegistered: boolean;
	isUserConnected: boolean;
	isSiteFullyConnected?: boolean;
}

function queryJetpackConnectionStatus(): Promise< ConnectionInfo > {
	// The following code only runs on Jetpack self-hosted sites.
	return wpcom.req.get( { path: '/connection', apiNamespace: 'jetpack/v4' } );
}

export function useJetpackConnectionStatus( siteId: number | null, isSimpleSites = false ) {
	return useQuery( {
		...getDefaultQueryParams< ConnectionInfo >(),
		queryKey: [ 'stats', 'jetpack-connnection-status', siteId, isSimpleSites ],
		queryFn: () => {
			// Simple sites are always connected, and sites in Calypso are always fully connected too, so we only check non-simple site in Odyssey Stats.
			if ( ! isSimpleSites && isOdysseyStats ) {
				return queryJetpackConnectionStatus();
			}
			return { isRegistered: true, isUserConnected: true };
		},
		select: ( data ) => ( {
			...data,
			isSiteFullyConnected: data.isRegistered && data.isUserConnected,
		} ),
		staleTime: 1000 * 60 * 1, // 1 minutes
	} );
}
