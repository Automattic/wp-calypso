/**
 * Utilities for managing persistent Agent session IDs.
 * Sessions are stored in localStorage after first server response and expire after 24 hours.
 * No temporary session IDs - server generates UUID on first message.
 *
 * Session lifecycle:
 * 1. New chat: sessionId = '' (empty)
 * 2. First message sent: server generates UUID and returns it
 * 3. Client stores UUID in localStorage via setSessionId()
 * 4. Subsequent loads: retrieve UUID from localStorage
 */
import { ORCHESTRATOR_AGENT_ID } from '../constants';

export const SESSION_STORAGE_KEY = 'agents-manager-session-id';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Session storage format.
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
 * Get existing session ID from localStorage if not expired.
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
 * Save session ID to localStorage.
 * @param sessionId - The session ID to save.
 */
export function setSessionId( sessionId: string, agentId?: string ): void {
	try {
		const session: StoredSession = {
			sessionId,
			timestamp: Date.now(),
		};
		localStorage.setItem( getSessionStorageKey( agentId ), JSON.stringify( session ) );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[agent-session] Error storing session ID:', error );
	}
}

/**
 * Reset to a new chat (clear session).
 * Returns empty string - server will generate UUID on first message.
 */
export function clearSessionId( agentId?: string ): void {
	try {
		localStorage.removeItem( getSessionStorageKey( agentId ) );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[agent-session] Error clearing session ID:', error );
	}
}
