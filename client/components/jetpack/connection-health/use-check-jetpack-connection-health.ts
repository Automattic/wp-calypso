import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { useDispatch } from 'calypso/state';
import {
	setJetpackConnectionHealthy,
	setJetpackConnectionUnhealthy,
} from 'calypso/state/jetpack-connection-health/actions';

export const JETPACK_CONNECTION_HEALTH_QUERY_KEY = 'jetpack-connection-health';

export interface JetpackConnectionHealth {
	is_healthy: boolean;
	error: string;
}

interface UseCheckJetpackConnectionHealthOptions {
	onError?: () => void;
	onSuccess?: ( data: JetpackConnectionHealth | undefined ) => void;
}

export const useCheckJetpackConnectionHealth = (
	siteId: number,
	options: UseCheckJetpackConnectionHealthOptions
) => {
	const dispatch = useDispatch();
	return useQuery< JetpackConnectionHealth, unknown, JetpackConnectionHealth >( {
		queryKey: [ JETPACK_CONNECTION_HEALTH_QUERY_KEY, siteId ],
		queryFn: () =>
			wp.req.get( {
				path: `/sites/${ siteId }/jetpack-connection-health`,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		staleTime: 10 * 1000,
		onError: options?.onError,
		onSuccess: ( data ) => {
			if ( data?.is_healthy ) {
				dispatch( setJetpackConnectionHealthy( siteId ) );
			} else {
				dispatch( setJetpackConnectionUnhealthy( siteId, data?.error ?? '' ) );
			}
		},
	} );
};
