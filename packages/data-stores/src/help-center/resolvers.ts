import { apiFetch } from '@wordpress/data-controls';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
import { wpcomRequest } from '../wpcom-request-controls';
import type { APIFetchOptions } from './types';

export function* isHelpCenterShown() {
	try {
		const preferences: {
			help_center_open: boolean;
		} = canAccessWpcomApis()
			? yield wpcomRequest( {
					path: '/me/preferences',
					apiNamespace: 'wpcom/v2',
			  } )
			: yield apiFetch( {
					global: true,
					path: `/help-center/open-state`,
			  } as APIFetchOptions );

		// We only want to auto-open, we don't want to auto-close (and potentially overrule the user's action).
		if ( preferences.help_center_open ) {
			return {
				type: 'HELP_CENTER_SET_SHOW',
				show: true,
			} as const;
		}
	} catch {}
}
