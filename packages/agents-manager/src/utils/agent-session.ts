/**
 * Utilities for the tab-scoped Agent session ID.
 *
 * The active session ID lives in `sessionStorage`, keyed per user, per site and
 * per agent, so each tab resumes its own conversation and a new tab starts
 * fresh. The tab's lifetime bounds the session — no expiry needed.
 *
 * The user belongs in the key because `sessionStorage` survives a logout and
 * login in the same tab: without it, the next account resumes the previous
 * account's conversation.
 */
import { ORCHESTRATOR_AGENT_ID } from '../constants';
import { generateUUID } from './generate-uuid';
import { getResolvedAgentId } from './resolved-agent-id';

/** Base storage key; `getTabSessionKey` scopes it per agent, site and user. */
const SESSION_STORAGE_KEY = 'agents-manager-session-id';

/** Scope placeholders for a chat with no selected site, or no logged-in user. */
const NO_SITE = 'no-site';
const NO_USER = 'no-user';

let activeSiteKey = NO_SITE;
let activeUserId = NO_USER;

/**
 * Set the site scope for the storage key. Published by the hosts on commit
 * for callers without React context (e.g. tracks); React callers pass their
 * scope explicitly instead.
 */
export function setSessionSiteKey( siteKey: string ): void {
	activeSiteKey = siteKey;
}

/** Set the user scope for the storage key. Published alongside the site scope. */
export function setSessionUserId( userId?: string | number ): void {
	activeUserId = normalizeUserId( userId );
}

function normalizeUserId( userId?: string | number ): string {
	return userId === undefined || userId === null ? NO_USER : String( userId );
}

function getTabSessionKey(
	agentId?: string,
	siteKey: string = activeSiteKey,
	userId?: string | number
): string {
	const agentSuffix = agentId && agentId !== ORCHESTRATOR_AGENT_ID ? `-${ agentId }` : '';
	// An omitted user falls through to the published scope, as `siteKey` does.
	const resolvedUserId = userId === undefined ? activeUserId : normalizeUserId( userId );
	return `${ SESSION_STORAGE_KEY }${ agentSuffix }-${ siteKey }-${ resolvedUserId }`;
}

/**
 * Get this tab's session ID, or an empty string if none exists. Pass `siteKey`
 * and `userId` to read a specific scope instead of the current one.
 */
export function getSessionId(
	agentId?: string,
	siteKey?: string,
	userId?: string | number
): string {
	try {
		return sessionStorage.getItem( getTabSessionKey( agentId, siteKey, userId ) ) || '';
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[agent-session] Error loading session ID:', error );
		return '';
	}
}

/**
 * The active session ID for non-React callers (ability callbacks, the Tracks
 * wrapper) — read under the agent scope the Provider publishes, so the answer
 * matches the mounted chat's on every surface, Dolly included.
 */
export function getActiveSessionId(): string {
	return getSessionId( getResolvedAgentId() );
}

/**
 * Save the given session ID as this tab's session. Pass `siteKey` and `userId`
 * to write under a specific scope instead of the current one.
 */
export function saveSessionId(
	sessionId: string,
	agentId?: string,
	siteKey?: string,
	userId?: string | number
): void {
	try {
		sessionStorage.setItem( getTabSessionKey( agentId, siteKey, userId ), sessionId );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[agent-session] Error saving session ID:', error );
	}
}

/**
 * Clear the stored session to start a new chat. Pass `siteKey` and `userId` to
 * clear a specific scope instead of the current one.
 */
export function clearSessionId(
	agentId?: string,
	siteKey?: string,
	userId?: string | number
): void {
	try {
		sessionStorage.removeItem( getTabSessionKey( agentId, siteKey, userId ) );
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
export function getOrCreateSessionId(
	agentId?: string,
	siteKey?: string,
	userId?: string | number
): string {
	const existing = getSessionId( agentId, siteKey, userId );
	if ( existing ) {
		return existing;
	}

	saveSessionId( generateUUID(), agentId, siteKey, userId );

	// Read back so unavailable storage yields a stable '' instead of a fresh
	// UUID per call, which would re-initialize the agent on every render.
	return getSessionId( agentId, siteKey, userId );
}
