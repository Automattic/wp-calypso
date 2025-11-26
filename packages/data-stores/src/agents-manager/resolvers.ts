import { apiFetch } from '@wordpress/data-controls';
import { Location } from 'history';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
import { wpcomRequest } from '../wpcom-request-controls';
import {
	setAgentsManagerRouterHistory,
	setIsDocked,
	setIsOpen,
	setIsLoading,
	setHasLoaded,
} from './actions';
import type { APIFetchOptions } from '../shared-types';

type Preferences = {
	calypso_preferences: {
		agents_manager_open?: boolean;
		agents_manager_docked?: boolean;
		agents_manager_router_history?: {
			entries: Location[];
			index: number;
		};
	};
};

export function* getAgentsManagerState() {
	yield setIsLoading( true );
	try {
		const { calypso_preferences: preferences }: Preferences = canAccessWpcomApis()
			? yield wpcomRequest( {
					path: '/me/preferences',
					apiNamespace: 'wpcom/v2',
			  } )
			: yield apiFetch( {
					global: true,
					path: '/agents-manager/open-state',
			  } as APIFetchOptions );

		// Restore the navigation history from preferences
		if ( preferences.agents_manager_router_history ) {
			yield setAgentsManagerRouterHistory( preferences.agents_manager_router_history );
		}

		// Restore the docked state from preferences
		if ( typeof preferences.agents_manager_docked === 'boolean' ) {
			yield setIsDocked( preferences.agents_manager_docked, false );
		}

		// We only want to auto-open, we don't want to auto-close (and potentially overrule the user's action).
		if ( preferences.agents_manager_open ) {
			yield setIsOpen( true, false );
		}
	} catch {
		// Ignore errors
	} finally {
		yield setIsLoading( false );
		yield setHasLoaded( true );
	}
}
