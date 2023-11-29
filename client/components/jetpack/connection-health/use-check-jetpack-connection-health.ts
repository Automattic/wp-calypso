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

	const { data, isSuccess } = query;
	const isHealthy = data?.is_healthy;
	const error = data?.error;

	useEffect( () => {
		if ( ! isSuccess ) {
			return;
		}
		if ( isHealthy && reduxIsUnhealthy ) {
			dispatch( setJetpackConnectionHealthy( siteId ) );
		}
		if ( ! isHealthy && ! reduxIsUnhealthy ) {
			dispatch( setJetpackConnectionUnhealthy( siteId, error ?? '' ) );
		}
	}, [ dispatch, reduxIsUnhealthy, isSuccess, isHealthy, error, siteId ] );

	return query;
};
