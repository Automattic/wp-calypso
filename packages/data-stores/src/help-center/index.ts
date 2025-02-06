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

let isRegistered = false;

// All end-to-end tests use a custom user agent containing this string.
const E2E_USER_AGENT = 'wp-e2e-tests';

export const isE2ETest = () =>
	typeof window !== 'undefined' && window.navigator.userAgent.includes( E2E_USER_AGENT );

export const isSupportSession = () => {
	if ( typeof window !== 'undefined' ) {
		return (
			'isSupportSession' in window ||
			// A bit hacky but much easier than passing down data from PHP in Jetpack
			// Simple
			!! document.querySelector( '#wp-admin-bar-support-session-details' ) ||
			!! document.querySelector( '#a8c-support-session-overlay' ) ||
			// Atomic
			document.body.classList.contains( 'support-session' )
		);
	}
	return false;
};

export function register(): typeof STORE_KEY {
	const enabledPesistedOpenState = ! isE2ETest() && ! isSupportSession();

	registerPlugins();

	if ( ! isRegistered ) {
		registerStore( STORE_KEY, {
			actions,
			reducer,
			controls: { ...controls, ...wpcomRequestControls },
			selectors,
			persist: [ 'message', 'userDeclaredSite', 'userDeclaredSiteUrl', 'subject' ],
			// Don't persist the open state for e2e users, because parallel tests will start interfering with each other.
			resolvers: enabledPesistedOpenState ? { isHelpCenterShown } : undefined,
		} );
		isRegistered = true;
	}

	return STORE_KEY;
}

export type { HelpCenterSite } from './types';
