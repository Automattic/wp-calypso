import apiFetch from '@wordpress/api-fetch';
import { select } from '@wordpress/data';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
import { wpcomRequest } from '../wpcom-request-controls';
import { STORE_KEY } from './constants';
import type { UpdateLaunchpadNavigatorResponse } from './types';
import type { GeneratorReturnType } from '../mapped-types';
import type { APIFetchOptions } from '../queries/use-launchpad-navigator';

export const receiveCurrentChecklist = ( currentChecklist: string | null ) =>
	( {
		type: 'LAUNCHPAD_NAVIGATOR_RECEIVE_CURRENT_CHECKLIST',
		current_checklist: currentChecklist,
	} as const );

export function* setCurrentChecklist( siteSlug: string, checklist_slug: string ) {
	const body = {
		current_checklist: checklist_slug,
	};

	// Get the current checklist_slug from the Redux state
	const currentChecklistSlug = select( STORE_KEY ).getCurrentChecklist();

	if ( currentChecklistSlug === checklist_slug ) {
		// If it's the same, you can return early or perform any other actions
		return receiveCurrentChecklist( checklist_slug );
	}

	const response: UpdateLaunchpadNavigatorResponse = canAccessWpcomApis()
		? yield wpcomRequest( {
				path: `/sites/${ siteSlug }/launchpad/navigator`,
				apiNamespace: 'wpcom/v2',
				method: 'PUT',
				body,
		  } )
		: yield apiFetch( {
				global: true,
				path: `/wpcom/v2/launchpad/navigator`,
				method: 'PUT',
				data: body,
		  } as APIFetchOptions );

	return receiveCurrentChecklist( response.current_checklist );
}

export type LaunchpadNavigatorAction =
	| ReturnType< typeof receiveCurrentChecklist >
	| GeneratorReturnType< typeof setCurrentChecklist >;
