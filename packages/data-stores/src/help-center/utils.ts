import { default as apiFetchPromise } from '@wordpress/api-fetch';
import { select } from '@wordpress/data';
import { isCookieAuthMissing } from 'wpcom-proxy-request';
import { isE2ETest } from '../utils';
import { default as wpcomRequestPromise, canAccessWpcomApis } from '../wpcom-request';
import { PREFERENCES_KEY, STORE_KEY } from './constants';
import type { HelpCenterSelect, Preferences } from './types';
import type { APIFetchOptions } from '../shared-types';

const memoryStore: Preferences[ 'calypso_preferences' ] = {
	help_center_open: undefined,
	help_center_minimized: false,
	help_center_router_history: null,
};

let helpCenterAppId: string | undefined;

export function setHelpCenterAppId( appId: string | undefined ): void {
	helpCenterAppId = appId;
}

function scopedKey( key: string ): string {
	return helpCenterAppId ? `${ key }_${ helpCenterAppId }` : key;
}

/**
 * Reads the app-scoped preference, falling back to the shared (unscoped) one.
 */
function readScoped< T extends keyof Preferences[ 'calypso_preferences' ] >(
	preferences: Preferences[ 'calypso_preferences' ],
	key: T
): Preferences[ 'calypso_preferences' ][ T ] | undefined {
	// The scoped key is dynamic, so the cast is confined here to keep callers typed.
	const scoped = (
		preferences as unknown as Record< string, Preferences[ 'calypso_preferences' ][ T ] >
	 )[ scopedKey( key ) ];
	return scoped ?? preferences[ key ];
}

export function deleteValuesSafely(): void {
	try {
		window.localStorage.removeItem( PREFERENCES_KEY + scopedKey( 'help_center_open' ) );
		window.localStorage.removeItem( PREFERENCES_KEY + scopedKey( 'help_center_minimized' ) );
		window.localStorage.removeItem( PREFERENCES_KEY + scopedKey( 'help_center_router_history' ) );
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
		window.localStorage.setItem( PREFERENCES_KEY + scopedKey( key ), JSON.stringify( value ) );
	} catch ( error ) {
		memoryStore[ key ] = value;
	}
}

export function retrieveValueSafely< T extends keyof Preferences[ 'calypso_preferences' ] >(
	key: T
): Preferences[ 'calypso_preferences' ][ T ] | undefined {
	try {
		// Prefer this app's scoped value, falling back to the shared (unscoped)
		// one when it hasn't stored its own yet.
		const value =
			window.localStorage.getItem( PREFERENCES_KEY + scopedKey( key ) ) ??
			window.localStorage.getItem( PREFERENCES_KEY + key );
		return value ? JSON.parse( value ) : undefined;
	} catch ( error ) {
		return memoryStore[ key ];
	}
}

/**
 * Cached promise to avoid multiple requests to the same endpoint. We only need preferences on boot.
 */
let cachedPreferencesPromise: Promise< Preferences[ 'calypso_preferences' ] > | undefined;

function getCalypsoPreferences(): Promise< Preferences[ 'calypso_preferences' ] > {
	// Caching the promise instead of the result allows parallel requests to queue and wait for one result.
	if ( cachedPreferencesPromise ) {
		return cachedPreferencesPromise;
	} else if ( canAccessWpcomApis() ) {
		cachedPreferencesPromise = wpcomRequestPromise< Preferences >( {
			path: '/me/preferences',
			apiNamespace: 'wpcom/v2',
		} ).then( ( preferences ) => preferences.calypso_preferences );
	} else {
		cachedPreferencesPromise = apiFetchPromise< Preferences[ 'calypso_preferences' ] >( {
			global: true,
			path: '/help-center/open-state',
		} as APIFetchOptions );
	}

	// Don't cache a failed request — clear it so a later read retries.
	cachedPreferencesPromise.catch( () => {
		cachedPreferencesPromise = undefined;
	} );

	return cachedPreferencesPromise;
}

export async function getPersistedPreference<
	T extends keyof Preferences[ 'calypso_preferences' ],
>( key: T ): Promise< Preferences[ 'calypso_preferences' ][ T ] | undefined > {
	const isLoggedIn = ( select( STORE_KEY ) as unknown as HelpCenterSelect ).getIsLoggedIn();

	// When the proxy session has no auth cookie (e.g. right after in-stepper signup) the
	// authed request 401s; fall back to localStorage instead, as for logged-out users.
	if ( isLoggedIn && ! isCookieAuthMissing() ) {
		const preferences = await getCalypsoPreferences();
		return readScoped( preferences, key );
	}

	return retrieveValueSafely( key );
}

/**
 * Save the open state of the help center to the remote user preferences or localStorage based on logged in status.
 * @param preference - The field to save.
 * @param value - The value to save.
 */
export function persistPreference< T extends keyof Preferences[ 'calypso_preferences' ] >(
	preference: T,
	value: Preferences[ 'calypso_preferences' ][ T ]
) {
	if ( isE2ETest() ) {
		return;
	}

	const newPreferences = { [ scopedKey( preference ) ]: value };

	const isLoggedIn = ( select( STORE_KEY ) as unknown as HelpCenterSelect ).getIsLoggedIn();

	if ( ! isLoggedIn ) {
		// Retrieve the logged out help center preferences from localStorage to coalesce the state.
		persistValueSafely( preference, value );
	} else if ( isLoggedIn ) {
		// Delete local preferences when logged in to avoid conflicts.
		deleteValuesSafely();

		if ( canAccessWpcomApis() ) {
			// Use the promise version to do that action without waiting for the result.
			wpcomRequestPromise( {
				path: '/me/preferences',
				apiNamespace: 'wpcom/v2',
				method: 'PUT',
				body: { calypso_preferences: newPreferences },
			} ).catch( () => {} );
		} else {
			// Use the promise version to do that action without waiting for the result.
			apiFetchPromise( {
				global: true,
				path: '/help-center/open-state',
				method: 'PUT',
				data: newPreferences,
			} as APIFetchOptions ).catch( () => {} );
		}
	}
}
