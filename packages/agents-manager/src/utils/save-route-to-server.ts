import apiFetch from '@wordpress/api-fetch';
import { select } from '@wordpress/data';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { AGENTS_MANAGER_STORE } from '../stores';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Replace the current entry in the persisted router history and save to the
 * server. No store dispatch, no re-renders.
 * @example
 * saveRouteToServer( '/chat', { state: { sessionId } } );
 * saveRouteToServer( '/zendesk', { state: { conversationId } } );
 */
export function saveRouteToServer( path: string, { state }: { state?: unknown } = {} ): void {
	const current = ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getRouterHistory();

	const entry = {
		pathname: path,
		search: '',
		hash: '',
		key: crypto.randomUUID(),
		state: state ?? null,
	};

	const entries = current?.entries?.length ? [ ...current.entries ] : [ entry ];
	const index = current?.entries?.length ? current.index ?? entries.length - 1 : 0;
	entries[ index ] = entry;

	const data = { agents_manager_router_history: { entries, index } };

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
