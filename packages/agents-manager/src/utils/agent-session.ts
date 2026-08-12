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
const SESSION_STORAGE_KEY = 'agents-manager-session-id';

let activeSiteKey = 'no-site';

/**
 * Set the site scope for the storage key. Published by the hosts on commit
 * for callers without React context (e.g. tracks); React callers pass their
 * scope explicitly instead.
 */
export function setSessionSiteKey( siteKey: string ): void {
	activeSiteKey = siteKey;
}

function getTabSessionKey( agentId?: string, siteKey: string = activeSiteKey ): string {
	const agentSuffix = agentId && agentId !== ORCHESTRATOR_AGENT_ID ? `-${ agentId }` : '';
	return `${ SESSION_STORAGE_KEY }${ agentSuffix }-${ siteKey }`;
}

/**
 * Get this tab's session ID, or an empty string if none exists. Pass `siteKey`
 * to read a specific site scope instead of the current one.
 */
export function getSessionId( agentId?: string, siteKey?: string ): string {
	try {
		return sessionStorage.getItem( getTabSessionKey( agentId, siteKey ) ) || '';
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[agent-session] Error loading session ID:', error );
		return '';
	}
}

/**
 * Save the given session ID as this tab's session. Pass `siteKey` to write
 * under a specific site scope instead of the current one.
 */
export function saveSessionId( sessionId: string, agentId?: string, siteKey?: string ): void {
	try {
		sessionStorage.setItem( getTabSessionKey( agentId, siteKey ), sessionId );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[agent-session] Error saving session ID:', error );
	}
}

/**
 * Clear the stored session to start a new chat.
 */
export function clearSessionId( agentId?: string, siteKey?: string ): void {
	try {
		sessionStorage.removeItem( getTabSessionKey( agentId, siteKey ) );
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
export function getOrCreateSessionId( agentId?: string, siteKey?: string ): string {
	const existing = getSessionId( agentId, siteKey );
	if ( existing ) {
		return existing;
	}

	saveSessionId( generateUUID(), agentId, siteKey );

	// Read back so unavailable storage yields a stable '' instead of a fresh
	// UUID per call, which would re-initialize the agent on every render.
	return getSessionId( agentId, siteKey );
}
