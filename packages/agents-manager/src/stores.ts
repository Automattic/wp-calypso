/**
 * External Dependencies
 */
import { AgentsManager } from '@automattic/data-stores';
import { isReaderChatHost } from './utils/is-reader-chat-agent';

export const AGENTS_MANAGER_STORE = AgentsManager.register( {
	shouldUsePersistedState: () => ! isReaderChatHost(),
} );
