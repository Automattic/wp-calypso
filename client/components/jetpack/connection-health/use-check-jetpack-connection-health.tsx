import { useQuery } from '@tanstack/react-query';
import { createHigherOrderComponent } from '@wordpress/compose';
import wp from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export const JETPACK_CONNECTION_HEALTH_QUERY_KEY = 'jetpack-connection-health';

export interface JetpackConnectionHealth {
	is_healthy: boolean;
	error: string;
}

export const useCheckJetpackConnectionHealth = ( siteId: number | null ) => {
	const query = useQuery< JetpackConnectionHealth, unknown, JetpackConnectionHealth >( {
		queryKey: [ JETPACK_CONNECTION_HEALTH_QUERY_KEY, siteId ],
		queryFn: async () => {
			const response = await wp.req.get( {
				path: `/sites/${ siteId }/jetpack-connection-health`,
				apiNamespace: 'wpcom/v2',
			} );
			return response;
		},
		// This is because we control the refetch based on query that is done on jetpack-blogs/${ siteId }/rest-api/ endpoint.
		staleTime: Infinity,
	} );

	return query;
};

export const withCheckJetpackConnectionHealth = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
		const { data } = useCheckJetpackConnectionHealth( siteId );
		return <Wrapped { ...props } siteIsConnected={ data?.is_healthy } />;
	},
	'withCheckJetpackConnectionHealth'
);
