import { controls } from '@wordpress/data';
import { apiFetch } from '@wordpress/data-controls';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
import { CurrentUser } from '../user/types';
import { retrieveValueSafely } from '../utils';
import { wpcomRequest } from '../wpcom-request-controls';
import { setHelpCenterPreferences } from './actions';
import { STORE_KEY } from './constants';
import { Preferences } from './types';
import type { APIFetchOptions } from '../shared-types';

/**
 * Retrieves the help center persisted preferences from the remote user preferences or localStorage based on logged in status.
 * @yields {Preferences} The help center persisted preferences.
 */
export function* getHelpCenterPreferences() {
	const currentUser: CurrentUser | undefined = yield controls.select( STORE_KEY, 'getCurrentUser' );
	const isLoggedIn = !! currentUser?.ID;

	if ( isLoggedIn ) {
		if ( canAccessWpcomApis() ) {
			const preferences: Preferences = yield wpcomRequest( {
				path: '/me/preferences',
				apiNamespace: 'wpcom/v2',
			} );
			yield setHelpCenterPreferences( preferences[ 'calypso_preferences' ] );
		} else {
			const preferences: Preferences[ 'calypso_preferences' ] = yield apiFetch( {
				global: true,
				path: '/help-center/open-state',
			} as APIFetchOptions );
			yield setHelpCenterPreferences( preferences );
		}
	} else {
		yield setHelpCenterPreferences(
			retrieveValueSafely< Preferences[ 'calypso_preferences' ] >(
				'logged_out_help_center_preferences'
			) ?? {}
		);
	}
}

export function* isHelpCenterShown() {
	try {
		const preferences: Preferences[ 'calypso_preferences' ] = yield controls.resolveSelect(
			STORE_KEY,
			'getHelpCenterPreferences'
		);

		// We only want to auto-open, we don't want to auto-close (and potentially overrule the user's action).
		if ( preferences.help_center_open ) {
			return {
				type: 'HELP_CENTER_SET_SHOW',
				show: true,
			} as const;
		}
	} catch {}
}

export function* getHelpCenterRouterHistory() {
	const route: string | null | undefined = yield controls.select( STORE_KEY, 'getNavigateToRoute' );

	// Don't use the history from the preferences if route is defined to avoid a race condition between restoring
	// persisted data and setting the support doc data. Persisted values could overwrite freshly fetched data.
	if ( typeof route === 'undefined' ) {
		const preferences: Preferences[ 'calypso_preferences' ] = yield controls.resolveSelect(
			STORE_KEY,
			'getHelpCenterPreferences'
		);

		yield {
			type: 'HELP_CENTER_SET_HELP_CENTER_ROUTER_HISTORY',
			history: preferences.help_center_router_history,
		} as const;
	}
}

export function* getIsMinimized() {
	const preferences: Preferences[ 'calypso_preferences' ] = yield controls.resolveSelect(
		STORE_KEY,
		'getHelpCenterPreferences'
	);
	return {
		type: 'HELP_CENTER_SET_MINIMIZED',
		minimized: preferences.help_center_minimized,
	} as const;
}
