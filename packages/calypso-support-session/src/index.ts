import debugModule from 'debug';
import bypassLocalStorage from './bypass-local-storage';

const debug = debugModule( 'calypso:support-user' );
const STORAGE_KEY = 'boot_support_user';

// `isSupportSession` and `isSSP` globals are added in client/document/index.jsx
declare global {
	interface Window {
		isSupportSession?: boolean;
		isSSP?: boolean;
	}
}

function getStoredSupportUser(): { user?: string; token?: string } {
	try {
		const storageValue = window.sessionStorage.getItem( STORAGE_KEY );
		return storageValue ? JSON.parse( storageValue ) : {};
	} catch {
		return {};
	}
}

function saveStoredSupportUser( storage: { user: string; token: string } ) {
	try {
		window.sessionStorage.setItem( STORAGE_KEY, JSON.stringify( storage ) );
	} catch {}
}

// Evaluate isSupportUserSession at module startup time, then freeze it
// for the remainder of the session. This is needed because the User
// module clears the store on change; it could return false if called
// after boot.
const _isSupportUserSession = ( () => {
	const supportUser = getStoredSupportUser();
	return supportUser && supportUser.user && supportUser.token;
} )();

export function isSupportUserSession() {
	return _isSupportUserSession;
}

export function isSupportNextSession() {
	return !! ( typeof window !== 'undefined' && window.isSupportSession );
}

/**
 * Whether the page is being viewed through the support session proxy — the
 * `ssp` cookie, which the server turns into the `isSSP` global. It is tracked
 * separately from `isSupportSession` server-side (client/server/pages/index.js),
 * so neither flag implies the other.
 */
export function isSupportSessionProxy() {
	return !! ( typeof window !== 'undefined' && window.isSSP );
}

/**
 * Whether a Happiness Engineer is working inside the user's account, by any of
 * the three mechanisms. Callers gating behavior that must not run on the
 * account holder's behalf — writes attributed to them, data persisted to the
 * HE's browser — want this rather than an individual check.
 */
export function isSupportSession() {
	return isSupportUserSession() || isSupportNextSession() || isSupportSessionProxy();
}

export function maybeInitializeSupportSession( wpcom: {
	setSupportUserToken: ( user: string, token: string, callback: ( error: Error ) => void ) => void;
} ) {
	if ( isSupportUserSession() ) {
		const { user, token } = getStoredSupportUser();
		debug( 'Booting Hosting Dashboard with support user', user );

		window.sessionStorage.removeItem( STORAGE_KEY );

		const handleBeforeUnload = () => {
			if ( user && token ) {
				saveStoredSupportUser( { user, token } );
			}
		};

		window.addEventListener( 'beforeunload', handleBeforeUnload );

		if ( user && token ) {
			wpcom.setSupportUserToken( user, token, ( error: Error ) => {
				debug( 'Deactivating support user and rebooting due to token error', error.message );

				window.sessionStorage.removeItem( STORAGE_KEY );
				window.removeEventListener( 'beforeunload', handleBeforeUnload );
				window.location.search = '';
			} );
		}
	}

	if ( isSupportNextSession() ) {
		debug( 'Booting Hosting Dashboard with support next session' );
		// "Support next" sessions don't need initializing because the
		// browser extension handles this case.
	}

	if ( isSupportSession() ) {
		// The following keys will not be bypassed as
		// they are safe to share across user sessions.
		const allowedKeys = [ 'debug' ];
		bypassLocalStorage( { allowedKeys } );
	}
}
