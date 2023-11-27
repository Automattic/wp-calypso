import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import wp from 'calypso/lib/wp';
import { useDispatch, useSelector } from 'calypso/state';
import {
	setJetpackConnectionHealthy,
	setJetpackConnectionUnhealthy,
} from 'calypso/state/jetpack-connection-health/actions';
import isJetpackConnectionUnhealthy from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-unhealthy';

export const JETPACK_CONNECTION_HEALTH_QUERY_KEY = 'jetpack-connection-health';

export interface JetpackConnectionHealth {
	is_healthy: boolean;
	error: string;
}

export const useCheckJetpackConnectionHealth = ( siteId: number ) => {
	const dispatch = useDispatch();
	const reduxIsUnhealthy = useSelector( ( state ) =>
		isJetpackConnectionUnhealthy( state, siteId )
	);

	const query = useQuery< JetpackConnectionHealth, unknown, JetpackConnectionHealth >( {
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
	} );

	const data = query.data;

	useEffect( () => {
		if ( ! data ) {
			return;
		}
		if ( data.is_healthy && reduxIsUnhealthy ) {
			dispatch( setJetpackConnectionHealthy( siteId ) );
		}
		if ( ! data.is_healthy && ! reduxIsUnhealthy ) {
			dispatch( setJetpackConnectionUnhealthy( siteId, data.error ?? '' ) );
		}
	}, [ dispatch, reduxIsUnhealthy, data, siteId ] );

	return query;
};
