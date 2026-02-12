import { apiFetch } from '@wordpress/data-controls';
import { Location } from 'history';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
import { wpcomRequest } from '../wpcom-request-controls';
import {
	setRouterHistory,
	setIsDocked,
	setIsOpen,
	setIsLoading,
	setHasLoaded,
	setFloatingPosition,
} from './actions';
import type { APIFetchOptions } from '../shared-types';

type Preferences = {
	calypso_preferences: {
		agents_manager_open?: boolean;
		agents_manager_docked?: boolean;
		agents_manager_floating_position?: 'left' | 'right';
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

		if ( preferences.agents_manager_router_history ) {
			yield setRouterHistory( preferences.agents_manager_router_history );
		}

		if ( typeof preferences.agents_manager_docked === 'boolean' ) {
			yield setIsDocked( preferences.agents_manager_docked, false );
		}

		if (
			preferences.agents_manager_floating_position === 'left' ||
			preferences.agents_manager_floating_position === 'right'
		) {
			yield setFloatingPosition( preferences.agents_manager_floating_position, false );
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
