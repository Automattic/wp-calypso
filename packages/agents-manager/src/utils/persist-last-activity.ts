import { AgentsManagerSelect } from '@automattic/data-stores';
import { select } from '@wordpress/data';
import { AGENTS_MANAGER_STORE, persistAgentsManagerState } from '../stores';

/**
 * Persist the current timestamp as the last activity for the given site key.
 * Merges with existing activity data for other sites.
 */
export function persistLastActivity( siteKey: string ): void {
	const store = select( AGENTS_MANAGER_STORE ) as unknown as AgentsManagerSelect;
	const existing = store.getAgentsManagerState().lastActivity || {};

	persistAgentsManagerState( {
		agents_manager_last_activity: { ...existing, [ siteKey ]: Date.now() },
	} );
}
