import { default as apiFetchPromise } from '@wordpress/api-fetch';
import { select } from '@wordpress/data';
import { Store } from 'redux';
import { default as wpcomRequestPromise, canAccessWpcomApis } from 'wpcom-proxy-request';
import { CurrentUser } from '../user/types';
import { isE2ETest, persistValueSafely } from '../utils';
import { setHelpCenterPreferences } from './actions';
import { STORE_KEY } from './constants';
import { State } from './reducer';
import type { HelpCenterSelect, Preferences } from './types';
import type { APIFetchOptions } from '../shared-types';

/**
 * Save the open state of the help center to the remote user preferences or localStorage based on logged in status.
 * @param preferences - The preferences to save.
 */
export function persistHelpCenterFields( preferences: Preferences[ 'calypso_preferences' ] ) {
	if ( isE2ETest() ) {
		return;
	}

	const helpCenterSelect = select( STORE_KEY ) as HelpCenterSelect;
	const currentUser: CurrentUser | undefined = helpCenterSelect.getCurrentUser();
	const isLoggedIn = !! currentUser?.ID;

	if ( ! isLoggedIn ) {
		// Retrieve the logged out help center preferences from localStorage to coalesce the state.
		persistValueSafely( 'logged_out_help_center_preferences', preferences );
	} else if ( isLoggedIn ) {
		if ( canAccessWpcomApis() ) {
			// Use the promise version to do that action without waiting for the result.
			wpcomRequestPromise( {
				path: '/me/preferences',
				apiNamespace: 'wpcom/v2',
				method: 'PUT',
				body: { calypso_preferences: preferences },
			} ).catch( () => {} );
		} else {
			// Use the promise version to do that action without waiting for the result.
			apiFetchPromise( {
				global: true,
				path: '/help-center/open-state',
				method: 'PUT',
				data: preferences,
			} as APIFetchOptions ).catch( () => {} );
		}
	}
}

/**
 * Subscribes to the store and persists some preferences either in Calypso Preferences or localStorage based on logged in status.
 * @param store - The store to subscribe to.
 */
export function subscribeToPersist( store: Store< State > ) {
	/**
	 * Customized persistence that supports both logged in and logged out users.
	 */
	store.subscribe( () => {
		const state = store.getState() as State;
		const preferences = { ...state.helpCenterPreferences };
		let shouldUpdatePreferences = false;
		if ( state.showHelpCenter !== undefined ) {
			// Only persist when the specific field actually changed
			if ( state.showHelpCenter !== preferences.help_center_open ) {
				preferences.help_center_open = state.showHelpCenter;
				shouldUpdatePreferences = true;
			}
			if (
				state.helpCenterRouterHistory !== undefined &&
				state.helpCenterRouterHistory !== preferences.help_center_router_history
			) {
				preferences.help_center_router_history = state.helpCenterRouterHistory;
				shouldUpdatePreferences = true;
			}
			if ( state.isMinimized !== preferences.help_center_minimized ) {
				preferences.help_center_minimized = state.isMinimized;
				shouldUpdatePreferences = true;
			}
			if ( shouldUpdatePreferences ) {
				store.dispatch( setHelpCenterPreferences( preferences ) );
				persistHelpCenterFields( preferences );
			}
		}
	} );
}
