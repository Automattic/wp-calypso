import { default as apiFetchPromise } from '@wordpress/api-fetch';
import { select } from '@wordpress/data';
import { default as wpcomRequestPromise, canAccessWpcomApis } from 'wpcom-proxy-request';
import { CurrentUser } from '../user/types';
import { isE2ETest, persistValueSafely, retrieveValueSafely } from '../utils';
import { STORE_KEY } from './constants';
import type { HelpCenterSelect, Preferences } from './types';
import type { APIFetchOptions } from '../shared-types';

/**
 * Save the open state of the help center to the remote user preferences or localStorage based on logged in status.
 * @param key - The key to save.
 * @param value - The value to save.
 */
export function persistHelpCenterField< T extends keyof Preferences[ 'calypso_preferences' ] >(
	key: T,
	value: Preferences[ 'calypso_preferences' ][ T ]
) {
	if ( isE2ETest() ) {
		return;
	}

	const saveState: Preferences[ 'calypso_preferences' ] = {};
	const helpCenterSelect = select( STORE_KEY ) as HelpCenterSelect;
	const currentUser: CurrentUser | undefined = helpCenterSelect.getCurrentUser();
	const isLoggedIn = !! currentUser?.ID;

	saveState[ key ] = value;

	if ( ! isLoggedIn ) {
		// Retrieve the logged out help center preferences from localStorage to coalesce the state.
		Object.assign( saveState, retrieveValueSafely( 'logged_out_help_center_preferences' ) ?? {} );
		persistValueSafely( 'logged_out_help_center_preferences', saveState );
	} else if ( isLoggedIn ) {
		if ( canAccessWpcomApis() ) {
			// Use the promise version to do that action without waiting for the result.
			wpcomRequestPromise( {
				path: '/me/preferences',
				apiNamespace: 'wpcom/v2',
				method: 'PUT',
				body: { calypso_preferences: saveState },
			} ).catch( () => {} );
		} else {
			// Use the promise version to do that action without waiting for the result.
			apiFetchPromise( {
				global: true,
				path: '/help-center/open-state',
				method: 'PUT',
				data: saveState,
			} as APIFetchOptions ).catch( () => {} );
		}
	}
}
