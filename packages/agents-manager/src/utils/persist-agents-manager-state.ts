import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

/**
 * Persists agents manager state to the server.
 * Uses wpcom API on WordPress.com, or apiFetch (REST API) on Jetpack sites.
 */
export function persistAgentsManagerState( data: Record< string, unknown > ): void {
	if ( canAccessWpcomApis() ) {
		wpcomRequest( {
			path: '/me/preferences',
			apiNamespace: 'wpcom/v2',
			method: 'PUT',
			body: { calypso_preferences: data },
		} ).catch( () => {} );
	} else {
		apiFetch( {
			global: true,
			path: '/agents-manager/open-state',
			method: 'PUT',
			data,
		} as Parameters< typeof apiFetch >[ 0 ] ).catch( () => {} );
	}
}
