/**
 * Utilities for reading and clearing persistent Agent session IDs.
 * Session IDs are written to `localStorage` by `agenttic-client` and expire after 24 hours.
 */
import { ORCHESTRATOR_AGENT_ID } from '../constants';
import { generateUUID } from './generate-uuid';

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

export const FRESH_SESSION_FLAG_PREFIX = 'agents-manager-session-fresh';

function getFreshFlagKey( agentId?: string ): string {
	return `${ FRESH_SESSION_FLAG_PREFIX }-${ agentId || 'default' }`;
}

/**
 * Check whether the current session is "fresh" — generated client-side and
 * never yet sent to the server. Callers can use this to skip an initial
 * server-side conversation fetch (there's nothing to fetch).
 * The flag clears automatically once a request is made with this session.
 */
export function isFreshSession( agentId?: string ): boolean {
	try {
		return localStorage.getItem( getFreshFlagKey( agentId ) ) === '1';
	} catch {
		return false;
	}
}

/**
 * Clear the fresh-session flag. Call after the first message round-trip
 * completes so subsequent page loads re-enable the server fetch.
 */
export function markSessionUsed( agentId?: string ): void {
	try {
		localStorage.removeItem( getFreshFlagKey( agentId ) );
	} catch {
		// ignore
	}
}

/**
 * Get an existing session ID from localStorage, or create + persist a new
 * client-side UUID. Use this when the caller wants a stable session ID
 * across page loads WITHOUT depending on agenttic-client's own write path
 * (which only fires after the server's first response).
 *
 * Pass isNewChat=true to force creation of a fresh session.
 */
export function getOrCreateSessionId( isNewChat: boolean, agentId?: string ): string {
	if ( isNewChat ) {
		clearSessionId( agentId );
	}
	const existing = getSessionId( agentId );
	if ( existing ) {
		return existing;
	}
	try {
		const newId = generateUUID();
		localStorage.setItem(
			getSessionStorageKey( agentId ),
			JSON.stringify( { sessionId: newId, timestamp: Date.now() } )
		);
		// Mark as fresh so useConversation can skip its initial server fetch.
		// Cleared after the first real request round-trip completes.
		localStorage.setItem( getFreshFlagKey( agentId ), '1' );
		return newId;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[agent-session] Error creating session ID:', error );
		return '';
	}
}
