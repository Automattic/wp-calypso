/**
 * External Dependencies
 */
import { AgentsManager } from '@automattic/data-stores';
import { getAgentsManagerInlineData } from './utils/get-agents-manager-inline-data';
import { usesLocalStatePersistence } from './utils/uses-local-state-persistence';

export const AGENTS_MANAGER_STORE = AgentsManager.register( {
	// Client-persisted hosts must not touch the per-user server store: it is
	// logged-in only, so an anonymous surface 401s on the resolver's read and on
	// every write. Read from inline data, not agentConfig — the resolver runs
	// before the config resolves.
	shouldUsePersistedState: () =>
		! usesLocalStatePersistence( getAgentsManagerInlineData()?.agentId ),
} );

// Serializes + coalesces concurrent saves so they can't clobber each other on
// the server's shared prefs blob. Re-exported here so the rest of the package
// reaches it without importing the data-stores barrel directly.
export const persistAgentsManagerState = AgentsManager.persistAgentsManagerState;
