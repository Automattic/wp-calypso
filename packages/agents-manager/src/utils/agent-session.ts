/**
 * Utilities for the tab-scoped Agent session ID.
 *
 * The active session ID lives in `sessionStorage`, keyed per site and per
 * agent, so each tab resumes its own conversation and a new tab starts fresh.
 * The tab's lifetime bounds the session — no expiry needed.
 */
import { ORCHESTRATOR_AGENT_ID } from '../constants';
import { generateUUID } from './generate-uuid';

/** Base storage key; `getTabSessionKey` scopes it per agent and per site. */
export const SESSION_STORAGE_KEY = 'agents-manager-session-id';

let activeSiteKey = 'no-site';

/**
 * Set the site scope for the storage key. Called by the host before any
 * session read, so callers without React context (e.g. tracks) resolve
 * the same key.
 */
export function setSessionSiteKey( siteKey: string ): void {
	activeSiteKey = siteKey;
}

function getTabSessionKey( agentId?: string ): string {
	const agentSuffix = agentId && agentId !== ORCHESTRATOR_AGENT_ID ? `-${ agentId }` : '';
	return `${ SESSION_STORAGE_KEY }${ agentSuffix }-${ activeSiteKey }`;
}

/**
 * Get this tab's session ID, or an empty string if none exists.
 */
export function getSessionId( agentId?: string ): string {
	try {
		return sessionStorage.getItem( getTabSessionKey( agentId ) ) || '';
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[agent-session] Error loading session ID:', error );
		return '';
	}
}

/**
 * Save the given session ID as this tab's session.
 */
export function saveSessionId( sessionId: string, agentId?: string ): void {
	try {
		sessionStorage.setItem( getTabSessionKey( agentId ), sessionId );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[agent-session] Error saving session ID:', error );
	}
}

/**
 * Clear the stored session to start a new chat.
 */
export function clearSessionId( agentId?: string ): void {
	try {
		sessionStorage.removeItem( getTabSessionKey( agentId ) );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[agent-session] Error clearing session ID:', error );
	}
}

/**
 * Get this tab's session ID, or create + persist a new client-side UUID.
 * Used by reader chat, where blog frontends reload on every navigation and
 * the orchestrator honors client-generated session IDs.
 */
export function getOrCreateSessionId( agentId?: string ): string {
	const existing = getSessionId( agentId );
	if ( existing ) {
		return existing;
	}
	const newId = generateUUID();
	saveSessionId( newId, agentId );
	return newId;
}
