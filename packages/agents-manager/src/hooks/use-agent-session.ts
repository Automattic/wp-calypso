/**
 * Hook for managing persistent Agent session IDs
 * Sessions are stored in localStorage after first server response and expire after 24 hours
 * No temporary session IDs - server generates UUID on first message
 */

import { useCallback, useState } from '@wordpress/element';

export const SESSION_STORAGE_KEY = 'agents-manager-session-id';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Session storage format
 */
interface StoredSession {
	sessionId: string;
	timestamp: number;
}

/**
 * Get existing session ID from localStorage if not expired
 * Returns empty string if no session exists or session expired
 */
const getExistingSessionId = (): string => {
	try {
		const stored = localStorage.getItem( SESSION_STORAGE_KEY );
		if ( stored ) {
			const session: StoredSession = JSON.parse( stored );

			// Check if session has expired
			if ( Date.now() - session.timestamp < SESSION_EXPIRY_MS ) {
				return session.sessionId;
			}

			// Session expired, clear it
			localStorage.removeItem( SESSION_STORAGE_KEY );
		}
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[useAgentSession] Error loading session ID:', error );
	}

	// No existing session - return empty string
	// Server will generate UUID on first message
	return '';
};

/**
 * Save session ID to localStorage
 * @param {string} sessionId - The session ID to save
 */
const saveSessionId = ( sessionId: string ): void => {
	try {
		const session: StoredSession = {
			sessionId,
			timestamp: Date.now(),
		};
		localStorage.setItem( SESSION_STORAGE_KEY, JSON.stringify( session ) );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[useAgentSession] Error storing session ID:', error );
	}
};

/**
 * Hook for managing Agent session state
 *
 * Session lifecycle:
 * 1. New chat: sessionId = '' (empty)
 * 2. First message sent: server generates UUID and returns it
 * 3. Client stores UUID in localStorage via applySessionId()
 * 4. Subsequent loads: retrieve UUID from localStorage
 */
export default function useAgentSession() {
	const [ sessionId, setSessionId ] = useState( getExistingSessionId );

	/**
	 * Reset to a new chat (clear session)
	 * Returns empty string - server will generate UUID on first message
	 */
	const resetSession = useCallback( () => {
		localStorage.removeItem( SESSION_STORAGE_KEY );
		setSessionId( '' );
		return '';
	}, [] );

	/**
	 * Apply session ID from server (save to localStorage and update state)
	 * This is called after server returns a sessionId
	 */
	const applySessionId = useCallback( ( newSessionId: string ) => {
		if ( newSessionId ) {
			saveSessionId( newSessionId );
			setSessionId( newSessionId );
		}
	}, [] );

	return {
		sessionId,
		resetSession,
		applySessionId,
	};
}
