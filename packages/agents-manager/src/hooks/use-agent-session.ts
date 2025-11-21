/**
 * Hook for managing persistent AI agent session IDs
 * Sessions are stored in localStorage and expire after a configurable duration
 */

import { useCallback, useState } from 'react';

const DEFAULT_STORAGE_KEY = 'agents-manager-session-id';
const DEFAULT_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Session storage format
 */
interface StoredSession {
	sessionId: string;
	timestamp: number;
}

/**
 * Generate unique session ID for this conversation
 */
const generateSessionId = ( prefix: string ): string => {
	const timestamp = Date.now();
	const random = Math.random().toString( 36 ).substring( 2, 10 );
	return `${ prefix }-${ timestamp }-${ random }`;
};

/**
 * Save session ID to localStorage
 * @param {string} storageKey - The localStorage key to use
 * @param {string} sessionId - The session ID to save
 */
const saveSessionId = ( storageKey: string, sessionId: string ): void => {
	try {
		const session: StoredSession = {
			sessionId,
			timestamp: Date.now(),
		};
		localStorage.setItem( storageKey, JSON.stringify( session ) );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AI Agent] Error storing session ID:', error );
	}
};

/**
 * Get or create persistent session ID
 * Reuses existing session ID from localStorage if not expired
 */
const getOrCreateSessionId = ( storageKey: string, expiryMs: number, prefix: string ): string => {
	try {
		const stored = localStorage.getItem( storageKey );
		if ( stored ) {
			const session: StoredSession = JSON.parse( stored );

			// Check if session has expired
			if ( Date.now() - session.timestamp < expiryMs ) {
				return session.sessionId;
			}

			// Session expired, clear it
			localStorage.removeItem( storageKey );
		}
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AI Agent] Error loading session ID:', error );
	}

	// Generate new session ID
	const newSessionId = generateSessionId( prefix );
	saveSessionId( storageKey, newSessionId );
	return newSessionId;
};

export interface UseAgentSessionResult {
	sessionId: string;
	resetSession: () => string;
}

export interface UseAgentSessionOptions {
	/**
	 * localStorage key for persisting session ID
	 * @default 'agents-manager-session-id'
	 */
	storageKey?: string;
	/**
	 * Session expiry duration in milliseconds
	 * @default 24 * 60 * 60 * 1000 (24 hours)
	 */
	expiryMs?: number;
	/**
	 * Prefix for generated session IDs
	 * @default 'ai-agent'
	 */
	sessionIdPrefix?: string;
}

/**
 * Hook for managing AI agent session state
 * @param {UseAgentSessionOptions} options - Configuration options
 */
export function useAgentSession( options: UseAgentSessionOptions = {} ): UseAgentSessionResult {
	const {
		storageKey = DEFAULT_STORAGE_KEY,
		expiryMs = DEFAULT_EXPIRY_MS,
		sessionIdPrefix = 'ai-agent',
	} = options;

	const [ sessionId, setSessionId ] = useState( () =>
		getOrCreateSessionId( storageKey, expiryMs, sessionIdPrefix )
	);

	const resetSession = useCallback( () => {
		const newSessionId = generateSessionId( sessionIdPrefix );
		saveSessionId( storageKey, newSessionId );
		setSessionId( newSessionId );
		return newSessionId;
	}, [ storageKey, sessionIdPrefix ] );

	return {
		sessionId,
		resetSession,
	};
}
