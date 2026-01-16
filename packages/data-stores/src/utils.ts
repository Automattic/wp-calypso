/**
 * Utility functions shared across data stores
 */

import { PREFERENCES_KEY } from './help-center/constants';
import type { Preferences } from './help-center/types';

declare const helpCenterData:
	| { isProxied: boolean; isSU: boolean; isSSP: boolean; currentUser: { ID: number } }
	| undefined;
declare const isSupportSession: boolean;
declare const isSSP: boolean;

// All end-to-end tests use a custom user agent containing this string.
const E2E_USER_AGENT = 'wp-e2e-tests';

export const isE2ETest = (): boolean =>
	typeof window !== 'undefined' && window.navigator.userAgent.includes( E2E_USER_AGENT );

export const isInSupportSession = () => {
	if ( typeof window !== 'undefined' ) {
		return (
			// A bit hacky but much easier than passing down data from PHP in Jetpack
			// Simple
			!! document.querySelector( '#wp-admin-bar-support-session-details' ) ||
			!! document.querySelector( '#a8c-support-session-overlay' ) ||
			// Atomic
			document.body.classList.contains( 'support-session' ) ||
			document.querySelector( '#wpcom > .is-support-session' ) ||
			( typeof isSupportSession !== 'undefined' && !! isSupportSession ) ||
			( typeof helpCenterData !== 'undefined' && helpCenterData?.isSU ) ||
			( typeof helpCenterData !== 'undefined' && helpCenterData?.isSSP ) ||
			( typeof isSSP !== 'undefined' && !! isSSP )
		);
	}
	return false;
};

const memoryStore: Preferences[ 'calypso_preferences' ] = {
	help_center_open: undefined,
	help_center_minimized: false,
	help_center_router_history: null,
};

export function deleteValuesSafely(): void {
	try {
		window.localStorage.removeItem( PREFERENCES_KEY + 'help_center_open' );
		window.localStorage.removeItem( PREFERENCES_KEY + 'help_center_minimized' );
		window.localStorage.removeItem( PREFERENCES_KEY + 'help_center_router_history' );
	} catch ( error ) {
		memoryStore.help_center_open = undefined;
		memoryStore.help_center_minimized = false;
		memoryStore.help_center_router_history = null;
	}
}

export function persistValueSafely< T extends keyof Preferences[ 'calypso_preferences' ] >(
	key: T,
	value: Preferences[ 'calypso_preferences' ][ T ]
): void {
	try {
		window.localStorage.setItem( key, JSON.stringify( value ) );
	} catch ( error ) {
		memoryStore[ key ] = value;
	}
}

export function retrieveValueSafely< T extends keyof Preferences[ 'calypso_preferences' ] >(
	key: T
): Preferences[ 'calypso_preferences' ][ T ] | undefined {
	try {
		const value = window.localStorage.getItem( PREFERENCES_KEY + key );
		return value ? JSON.parse( value ) : undefined;
	} catch ( error ) {
		return memoryStore[ key ];
	}
}
