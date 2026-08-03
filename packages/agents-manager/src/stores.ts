/**
 * External Dependencies
 */
import { AgentsManager } from '@automattic/data-stores';
import { isReaderChatHost } from './utils/is-reader-chat-agent';

export const AGENTS_MANAGER_STORE = AgentsManager.register( {
	shouldLoadPersistedState: () => ! isReaderChatHost(),
} );

// Serializes + coalesces concurrent saves so they can't clobber each other on
// the server's shared prefs blob. Re-exported here so the rest of the package
// reaches it without importing the data-stores barrel directly.
export const persistAgentsManagerState = AgentsManager.persistAgentsManagerState;
