/**
 * Session utilities for Image Studio
 *
 * Provides session ID management with fallback support for different environments.
 */

// Type definition for window with potential agents-manager session
declare global {
	interface Window {
		agentsManager?: {
			getSessionId?: () => string;
		};
	}
}

const SESSION_STORAGE_KEY = 'image-studio-session-id';
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface StoredSession {
	sessionId: string;
	timestamp: number;
}

/**
 * Generate a simple UUID v4
 * @returns Generated UUID string
 */
function generateSessionId(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace( /[xy]/g, function ( c ) {
		const r = ( Math.random() * 16 ) | 0;
		const v = c === 'x' ? r : ( r & 0x3 ) | 0x8;
		return v.toString( 16 );
	} );
}

/**
 * Get the current session ID.
 * Uses agents-manager session if available, falls back to localStorage.
 * @returns The current session ID
 */
export function getSessionId(): string {
	// Try agents-manager first (if available via window global)
	if ( typeof window !== 'undefined' && window.agentsManager?.getSessionId ) {
		const sessionId = window.agentsManager.getSessionId();
		if ( sessionId ) {
			return sessionId;
		}
	}

	// Fallback to local storage
	try {
		const stored = localStorage.getItem( SESSION_STORAGE_KEY );
		if ( stored ) {
			const session: StoredSession = JSON.parse( stored );

			// Check if session has expired
			if ( Date.now() - session.timestamp < SESSION_EXPIRY_MS ) {
				return session.sessionId;
			}

			// Session expired, generate new one
			localStorage.removeItem( SESSION_STORAGE_KEY );
		}
	} catch ( error ) {
		// Ignore localStorage errors
	}

	// Generate a new session ID
	const newSessionId = generateSessionId();
	try {
		const session: StoredSession = {
			sessionId: newSessionId,
			timestamp: Date.now(),
		};
		localStorage.setItem( SESSION_STORAGE_KEY, JSON.stringify( session ) );
	} catch ( error ) {
		// Ignore localStorage errors
	}

	return newSessionId;
}
