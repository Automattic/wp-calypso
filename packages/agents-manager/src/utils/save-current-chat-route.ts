import apiFetch from '@wordpress/api-fetch';
import { select } from '@wordpress/data';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { AGENTS_MANAGER_STORE } from '../stores';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/**
 * Saves the current `/chat` route with the session ID to the server,
 * so the last conversation can be restored on page load.
 */
export function saveCurrentChatRoute( sessionId: string ): void {
	const current = ( select( AGENTS_MANAGER_STORE ) as AgentsManagerSelect ).getRouterHistory();

	const entry = {
		pathname: '/chat',
		search: '',
		hash: '',
		key: crypto.randomUUID(),
		state: { sessionId },
	};

	// Clone the existing history stack, or start empty if none exists yet.
	// Then replace the entry at the current index with the new chat route.
	const entries = current?.entries?.length ? [ ...current.entries ] : [];
	const index = current?.index ?? 0;
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
