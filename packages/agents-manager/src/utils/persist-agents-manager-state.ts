import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

/**
 * Persists agents manager state to the server.
 */
export function persistAgentsManagerState( data: Record< string, unknown > ): void {
	if ( canAccessWpcomApis() ) {
		wpcomRequest( {
			path: '/agents-manager/state',
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			body: { state: data },
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
