import debug from './debug';
import { invokeSurvicateEvent } from './invoke-event';

const COOKIE_PREFIX = 'survicate_pending_';
const MAX_AGE_SECONDS = 30 * 60;

function getCookieName( eventName: string ): string {
	return `${ COOKIE_PREFIX }${ eventName }`;
}

// A cookie rather than web storage so the flag survives the hop from
// wordpress.com to the Multi-site Dashboard on my.wordpress.com.
function getCookieDomain(): string {
	const { hostname } = window.location;
	if ( hostname === 'wordpress.com' || hostname.endsWith( '.wordpress.com' ) ) {
		return '; domain=.wordpress.com';
	}
	return '';
}

function writeCookie( name: string, value: string, maxAge: number ): void {
	try {
		document.cookie = `${ name }=${ value }; path=/; max-age=${ maxAge }; SameSite=Lax${ getCookieDomain() }`;
	} catch {
		// Cookies may be unavailable (e.g. sandboxed iframes).
	}
}

function hasCookie( name: string ): boolean {
	try {
		return document.cookie.split( '; ' ).some( ( cookie ) => cookie.startsWith( `${ name }=` ) );
	} catch {
		return false;
	}
}

/**
 * Remembers a Survicate event to fire on a later page, for actions that are
 * followed by a full-page navigation (which would tear down a survey shown on
 * the spot). The flag expires after 30 minutes.
 */
export function queueSurvicateEvent( eventName: string ): void {
	debug( 'Queueing Survicate event "%s"', eventName );
	writeCookie( getCookieName( eventName ), '1', MAX_AGE_SECONDS );
}

/**
 * Fires a Survicate event queued with `queueSurvicateEvent()`, at most once.
 * Does nothing if the event wasn't queued.
 * @returns A cleanup function that removes the `SurvicateReady` listener.
 */
export function invokeQueuedSurvicateEvent( eventName: string ): () => void {
	const name = getCookieName( eventName );
	if ( ! hasCookie( name ) ) {
		return () => {};
	}

	writeCookie( name, '', 0 );
	return invokeSurvicateEvent( eventName );
}
