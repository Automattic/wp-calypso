import { registerStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import { registerPlugins } from '../plugins';
import { isE2ETest, isInSupportSession } from '../utils';
import { controls as wpcomRequestControls } from '../wpcom-request-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as resolvers from './resolvers';
import * as selectors from './selectors';
import { persistHelpCenterField } from './utils';
export type { State };

let isRegistered = false;

export function register(): typeof STORE_KEY {
	const enabledPersistedOpenState = ! isE2ETest() && ! isInSupportSession();

	registerPlugins();

	if ( ! isRegistered ) {
		const store = registerStore( STORE_KEY, {
			actions,
			reducer,
			controls: { ...controls, ...wpcomRequestControls },
			selectors,
			persist: [
				'message',
				'userDeclaredSite',
				'userDeclaredSiteUrl',
				'subject',
				'loggedOutOdieChat',
			],
			// Don't persist the open state for e2e users, because parallel tests will start interfering with each other.
			resolvers: enabledPersistedOpenState ? resolvers : undefined,
		} );
		isRegistered = true;

		/**
		 * Customized persistence that supports both logged in and logged out users.
		 */
		store.subscribe( () => {
			const state = store.getState() as State;
			const preferences = state.helpCenterPreferences;
			if ( state.showHelpCenter !== undefined ) {
				// Only persist when the specific field actually changed
				if ( state.showHelpCenter !== preferences.help_center_open ) {
					persistHelpCenterField( 'help_center_open', state.showHelpCenter );
				}
				if (
					state.helpCenterRouterHistory !== undefined &&
					state.helpCenterRouterHistory !== preferences.help_center_router_history
				) {
					persistHelpCenterField( 'help_center_router_history', state.helpCenterRouterHistory );
				}
				if ( state.isMinimized !== preferences.help_center_minimized ) {
					persistHelpCenterField( 'help_center_minimized', state.isMinimized );
				}
			}
		} );
	}

	return STORE_KEY;
}

export type { HelpCenterSite } from './types';
