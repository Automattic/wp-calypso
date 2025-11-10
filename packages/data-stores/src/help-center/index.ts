import { registerStore, dispatch } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import { registerPlugins } from '../plugins';
import { controls as wpcomRequestControls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as selectors from './selectors';
import type { Dispatch } from './types';
export type { State };

declare const helpCenterData: { isProxied: boolean; isSU: boolean; isSSP: boolean } | undefined;
declare const isSupportSession: boolean;
declare const isSSP: boolean;

let isRegistered = false;

// All end-to-end tests use a custom user agent containing this string.
const E2E_USER_AGENT = 'wp-e2e-tests';

export const isE2ETest = () =>
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

export function register( {
	skipPersistedOpenState,
}: { skipPersistedOpenState?: boolean } = {} ): typeof STORE_KEY {
	registerPlugins();

	if ( ! isRegistered ) {
		registerStore( STORE_KEY, {
			actions,
			reducer,
			controls: { ...controls, ...wpcomRequestControls },
			selectors,
			persist: [ 'message', 'userDeclaredSite', 'userDeclaredSiteUrl', 'subject' ],
		} );
		isRegistered = true;

		// Don't persist the open state for e2e users, because parallel tests will start interfering with each other.
		if ( ! skipPersistedOpenState && ! isE2ETest() && ! isInSupportSession() ) {
			( dispatch( STORE_KEY ) as Dispatch ).loadHelpCenterPreference();
		}
	}

	return STORE_KEY;
}

export function registerAsync(): ReturnType< typeof register > {
	// Skip persisted state here to avoid a race condition between restoring persisted data
	// and setting the support doc data. Persisted values could overwrite freshly fetched data.
	return register( { skipPersistedOpenState: true } );
}

export type { HelpCenterSite } from './types';
