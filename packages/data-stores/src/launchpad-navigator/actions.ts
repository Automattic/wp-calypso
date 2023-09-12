import apiFetch, { type APIFetchOptions } from '@wordpress/api-fetch';
import { select } from '@wordpress/data';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { STORE_KEY } from './constants';
import type { UpdateLaunchpadNavigatorResponse } from './types';
import type { GeneratorReturnType } from '../mapped-types';

export const receiveActiveChecklistSlug = ( activeChecklistSlug: string | null ) =>
	( {
		type: 'LAUNCHPAD_NAVIGATOR_RECEIVE_ACTIVE_CHECKLIST_SLUG',
		active_checklist_slug: activeChecklistSlug,
	} as const );

export function* setActiveChecklist( siteSlug: string, active_checklist_slug: string ) {
	const body = {
		active_checklist_slug,
	};

	// Get the current active_checklist_slug from the Redux state
	const activeChecklistSlug = select( STORE_KEY ).getActiveChecklistSlug();

	if ( activeChecklistSlug === active_checklist_slug ) {
		// If it's the same, you can return early or perform any other actions
		return receiveActiveChecklistSlug( active_checklist_slug );
	}

	let response: UpdateLaunchpadNavigatorResponse;

	if ( canAccessWpcomApis() ) {
		response = yield wpcomRequest( {
			path: `/sites/${ siteSlug }/launchpad/navigator`,
			apiNamespace: 'wpcom/v2',
			method: 'PUT',
			body,
		} );
	} else {
		response = yield apiFetch( {
			global: true,
			path: `/wpcom/v2/launchpad/navigator`,
			method: 'PUT',
			data: body,
		} as APIFetchOptions );
	}

	return receiveActiveChecklistSlug( response.active_checklist_slug );
}

export type LaunchpadNavigatorAction =
	| ReturnType< typeof receiveActiveChecklistSlug >
	| GeneratorReturnType< typeof setActiveChecklist >;
