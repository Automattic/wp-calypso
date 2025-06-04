import { registerStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import { registerPlugins } from '../plugins';
import { controls as wpcomRequestControls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import { isHelpCenterShown } from './resolvers';
import * as selectors from './selectors';
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

export function register(): typeof STORE_KEY {
	const enabledPersistedOpenState = ! isE2ETest() && ! isInSupportSession();

	registerPlugins();

	if ( ! isRegistered ) {
		registerStore( STORE_KEY, {
			actions,
			reducer,
			controls: { ...controls, ...wpcomRequestControls },
			selectors,
			persist: [ 'message', 'userDeclaredSite', 'userDeclaredSiteUrl', 'subject' ],
			// Don't persist the open state for e2e users, because parallel tests will start interfering with each other.
			resolvers: enabledPersistedOpenState ? { isHelpCenterShown } : undefined,
		} );
		isRegistered = true;
	}

	return STORE_KEY;
}

export type { HelpCenterSite } from './types';
