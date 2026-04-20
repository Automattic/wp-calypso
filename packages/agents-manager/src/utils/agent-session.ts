/**
 * Utilities for reading and clearing persistent Agent session IDs.
 * Session IDs are written to `localStorage` by `agenttic-client` and expire after 24 hours.
 */
import { ORCHESTRATOR_AGENT_ID } from '../constants';

export const SESSION_STORAGE_KEY = 'agents-manager-session-id';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get the `localStorage` key for the given agent.
 */
export function getSessionStorageKey( agentId?: string ): string {
	if ( agentId && agentId !== ORCHESTRATOR_AGENT_ID ) {
		return `${ SESSION_STORAGE_KEY }-${ agentId }`;
	}
	return SESSION_STORAGE_KEY;
}

interface StoredSession {
	sessionId: string;
	timestamp: number;
}

/**
 * Get existing session ID from `localStorage` if not expired.
 * Reads from the same storage key used by `agenttic-client` (via `sessionIdStorageKey` config).
 * Returns empty string if no session exists or session expired.
 * @returns The current session ID, or an empty string if no valid session exists.
 */
export function getSessionId( agentId?: string ): string {
	try {
		const key = getSessionStorageKey( agentId );
		const stored = localStorage.getItem( key );
		if ( stored ) {
			const session: StoredSession = JSON.parse( stored );

			// Check if session has expired
			if ( Date.now() - session.timestamp < SESSION_EXPIRY_MS ) {
				return session.sessionId;
			}

			// Session expired, clear it
			localStorage.removeItem( key );
		}
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[agent-session] Error loading session ID:', error );
	}

	// No existing session - return empty string
	// Server will generate UUID on first message
	return '';
}

/**
 * Clear the stored session to start a new chat.
 */
export function clearSessionId( agentId?: string ): void {
	try {
		localStorage.removeItem( getSessionStorageKey( agentId ) );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[agent-session] Error clearing session ID:', error );
	}
}
