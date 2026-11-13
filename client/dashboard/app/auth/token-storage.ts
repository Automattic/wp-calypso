import { isSupportNextSession } from '@automattic/calypso-support-session';
import store from 'store';

/**
 * Where the OAuth token lives.
 *
 * Normally in localStorage, shared with the classic app on the same host. In an extension support
 * session (`window.isSupportSession`) the OAuth authorize request runs as the customer too, so the
 * token it returns is the customer's: it goes to sessionStorage, which the session's localStorage
 * bypass leaves alone and which the tab takes with it, so the token is never picked up outside the
 * session. The callback page is a separate navigation whose session flag depends on the extension
 * sending its header, so the tab also records that the flow started inside a session.
 */

const TOKEN_KEY = 'wpcom_token';
const EXPIRES_IN_KEY = 'wpcom_token_expires_in';
const FLOW_KEY = 'wpcom_oauth_support_session';

function readTab( key: string ): string | null {
	try {
		return window.sessionStorage.getItem( key );
	} catch {
		return null;
	}
}

function writeTab( key: string, value: string ): void {
	try {
		window.sessionStorage.setItem( key, value );
	} catch {
		// sessionStorage can be unavailable in private contexts.
	}
}

function removeTab( key: string ): void {
	try {
		window.sessionStorage.removeItem( key );
	} catch {
		// Nothing to remove.
	}
}

export function markOAuthFlow(): void {
	if ( isSupportNextSession() ) {
		writeTab( FLOW_KEY, '1' );
		return;
	}
	removeTab( FLOW_KEY );
}

export function saveToken( token: string, expiresIn?: string | null ): void {
	const fromSupportSession = isSupportNextSession() || readTab( FLOW_KEY ) === '1';
	removeTab( FLOW_KEY );

	if ( fromSupportSession ) {
		writeTab( TOKEN_KEY, token );
		if ( expiresIn ) {
			writeTab( EXPIRES_IN_KEY, expiresIn );
		}
		return;
	}

	store.set( TOKEN_KEY, token );
	if ( expiresIn ) {
		store.set( EXPIRES_IN_KEY, expiresIn );
	}
}

/**
 * The saved token, if any.
 *
 * Inside a support session a token the session obtained wins; the user's own token in localStorage
 * still counts, since the session header decides who a request acts as and the token only has to
 * come from an allowed client. Outside a session a token an earlier session left in the tab is
 * dropped.
 *
 * Must run before the support session replaces localStorage, which would hide a saved token.
 */
export function getSavedToken(): string | undefined {
	const tabToken = readTab( TOKEN_KEY );
	if ( tabToken ) {
		if ( isSupportNextSession() ) {
			return tabToken;
		}
		removeTab( TOKEN_KEY );
		removeTab( EXPIRES_IN_KEY );
	}

	return store.get( TOKEN_KEY ) || undefined;
}
