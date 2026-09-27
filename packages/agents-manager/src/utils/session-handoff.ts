/**
 * `sessionStorage` is per origin, so a same-tab navigation between Calypso and
 * wp-admin would lose the tab's conversation. The leaving page adds the session
 * and its site scope to the link's URL; the landing page stores them again.
 */
import { ORCHESTRATOR_AGENT_ID } from '../constants';

export const SESSION_HANDOFF_PARAM = 'wp-agent-chat';
export const SITE_HANDOFF_PARAM = 'wp-agent-site';

/** Calypso and the Dashboard run the Agents Manager on every page. */
const CALYPSO_HOSTS = [ 'wordpress.com', 'my.wordpress.com' ];

/** WordPress.com-hosted sites run it only in wp-admin, like the current site's own domain. */
const SITE_HOST_SUFFIXES = [ '.wordpress.com', '.wpcomstaging.com' ];

export interface SessionHandoff {
	sessionId: string;
	/** The session's site scope; absent (e.g. the site-transfer redirect) means the landing page's. */
	siteKey?: string;
}

/**
 * Only the main chat hands its session across origins: the backend looks a
 * chat up by agent, and surface-bound agents (reader chat, Plugin Compass,
 * host overrides) have no counterpart on the other origin.
 */
export function isHandoffAgent( agentId?: string ): boolean {
	return agentId === ORCHESTRATOR_AGENT_ID;
}

/**
 * Whether a link leaves the current origin for another page that runs the
 * Agents Manager. A site's frontend never does, and its code can read the
 * query string, so only its wp-admin qualifies.
 */
export function isHandoffDestination(
	link: Pick< URL, 'origin' | 'protocol' | 'hostname' | 'pathname' >,
	currentOrigin: string,
	siteDomain?: string
): boolean {
	if ( link.origin === currentOrigin || link.protocol !== 'https:' ) {
		return false;
	}
	if ( CALYPSO_HOSTS.includes( link.hostname ) ) {
		return true;
	}

	const isSiteHost =
		link.hostname === siteDomain ||
		SITE_HOST_SUFFIXES.some( ( suffix ) => link.hostname.endsWith( suffix ) );
	return isSiteHost && link.pathname.startsWith( '/wp-admin/' );
}

/** Replaces any handoff already in the URL. */
export function addSessionHandoff( href: string, sessionId: string, siteKey: string ): string {
	const url = new URL( href );
	url.searchParams.set( SESSION_HANDOFF_PARAM, sessionId );
	url.searchParams.set( SITE_HANDOFF_PARAM, siteKey );
	return url.href;
}

export function readSessionHandoff( search: string ): SessionHandoff | null {
	const params = new URLSearchParams( search );
	const sessionId = params.get( SESSION_HANDOFF_PARAM );
	if ( ! sessionId ) {
		return null;
	}

	return { sessionId, siteKey: params.get( SITE_HANDOFF_PARAM ) || undefined };
}
