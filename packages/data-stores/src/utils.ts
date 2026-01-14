/**
 * Utility functions shared across data stores
 */

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

const memoryStore: { [ key: string ]: unknown } = {};

export function persistValueSafely< T >( key: string, value: T ): void {
	try {
		window.localStorage.setItem( key, JSON.stringify( value ) );
	} catch ( error ) {
		memoryStore[ key ] = value;
	}
}

export function retrieveValueSafely< T >( key: string ): T | undefined {
	try {
		const value = window.localStorage.getItem( key );
		return value ? JSON.parse( value ) : undefined;
	} catch ( error ) {
		return memoryStore[ key ] as T | undefined;
	}
}
