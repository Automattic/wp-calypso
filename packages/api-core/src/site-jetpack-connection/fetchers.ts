import { wpcom } from '../wpcom-fetcher';
import type { JetpackConnection, JetpackConnectionHealth, JetpackTestConnection } from './types';

export async function fetchJetpackConnection( siteId: number ): Promise< JetpackConnection > {
	const { data } = await wpcom.req.get( `/jetpack-blogs/${ siteId }/rest-api/`, {
		path: '/jetpack/v4/connection/',
	} );

	return data;
}

export async function fetchJetpackConnectionHealth(
	siteId: number
): Promise< JetpackConnectionHealth > {
	return wpcom.req.get( {
		path: `/sites/${ siteId }/jetpack-connection-health`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchJetpackTestConnection(
	siteId: number,
	isStaleConnectionHealthy: boolean
): Promise< JetpackTestConnection > {
	return wpcom.req.get(
		{
			path: `/jetpack-blogs/${ siteId }/test-connection`,
			apiNamespace: 'rest/v1.1',
		},
		{
			// We call the current health state "stale", as it might be different than the actual state.
			is_stale_connection_healthy: isStaleConnectionHealthy,
		}
	);
}
