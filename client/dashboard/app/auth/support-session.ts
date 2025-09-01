import debugModule from 'debug';
import wpcom from 'calypso/lib/wp';
import bypassLocalStorage from './bypass-local-storage';

const debug = debugModule( 'calypso:support-user' );
const STORAGE_KEY = 'boot_support_user';

// `isSupportSession` global is added in client/document/index.jsx
declare global {
	interface Window {
		isSupportSession?: boolean;
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

export function isSupportSession() {
	return isSupportUserSession() || isSupportNextSession();
}

export function maybeInitializeSupportSession() {
	if ( isSupportUserSession() ) {
		const { user, token } = getStoredSupportUser();
		debug( 'Booting hosting dashboard with support user', user );

		window.sessionStorage.removeItem( STORAGE_KEY );

		const handleBeforeUnload = () => {
			if ( user && token ) {
				saveStoredSupportUser( { user, token } );
			}
		};

		window.addEventListener( 'beforeunload', handleBeforeUnload );

		wpcom.setSupportUserToken( user, token, ( error: Error ) => {
			debug( 'Deactivating support user and rebooting due to token error', error.message );

			window.sessionStorage.removeItem( STORAGE_KEY );
			window.removeEventListener( 'beforeunload', handleBeforeUnload );
			window.location.search = '';
		} );
	}

	if ( isSupportNextSession() ) {
		debug( 'Booting hosting dashboard with support next session' );
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
