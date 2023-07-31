import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const JETPACK_CONNECTION_HEALTH_QUERY_KEY = 'jetpack-connection-health';

export interface JetpackConnectionHealth {
	is_healthy: boolean;
	error: string;
}

export const useCheckJetpackConnectionHealth = ( siteId: number, options: UseQueryOptions ) => {
	return useQuery< JetpackConnectionHealth, unknown, JetpackConnectionHealth >( {
		queryKey: [ JETPACK_CONNECTION_HEALTH_QUERY_KEY, siteId ],
		queryFn: () =>
			wp.req.get( {
				path: `/sites/${ siteId }/jetpack-connection-health`,
				apiNamespace: 'wpcom/v2',
			} ),
		select: ( data ) => {
			return data;
		},
		meta: {
			persist: false,
		},
		staleTime: 10 * 1000,
		onError: options?.onError,
		onSuccess: options?.onSuccess,
	} );
};
