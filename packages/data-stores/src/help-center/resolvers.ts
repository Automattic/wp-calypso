import { apiFetch } from '@wordpress/data-controls';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
import { wpcomRequest } from '../wpcom-request-controls';
import { setHelpCenterRouterHistory, setIsMinimized } from './actions';
import type { APIFetchOptions } from './types';
import type { Location } from 'history';

type Preferences = {
	calypso_preferences: {
		help_center_open: boolean;
		help_center_minimized: boolean;
		help_center_router_history: {
			entries: Location[];
			index: number;
		};
	};
};

export function* isHelpCenterShown() {
	try {
		const { calypso_preferences: preferences }: Preferences = canAccessWpcomApis()
			? yield wpcomRequest( {
					path: '/me/preferences',
					apiNamespace: 'wpcom/v2',
			  } )
			: yield apiFetch( {
					global: true,
					path: '/help-center/open-state',
			  } as APIFetchOptions );

		if ( preferences.help_center_router_history ) {
			yield setHelpCenterRouterHistory( preferences.help_center_router_history );
		}

		yield setIsMinimized( preferences.help_center_minimized );

		// We only want to auto-open, we don't want to auto-close (and potentially overrule the user's action).
		if ( preferences.help_center_open ) {
			return {
				type: 'HELP_CENTER_SET_SHOW',
				show: true,
			} as const;
		}
	} catch {}
}
