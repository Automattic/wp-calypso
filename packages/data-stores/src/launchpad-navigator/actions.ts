import apiFetch from '@wordpress/api-fetch';
import { canAccessWpcomApis } from 'wpcom-proxy-request';
import { GeneratorReturnType } from '../mapped-types';
import { wpcomRequest } from '../wpcom-request-controls';
import { APIFetchOptions, UpdateLaunchpadNavigatorResponse } from './types';

export const receiveCurrentChecklist = ( currentChecklist: string ) =>
	( {
		type: 'LAUNCHPAD_NAVIGATOR_RECEIVE_CURRENT_CHECKLIST',
		current_checklist: currentChecklist,
	} as const );

export function* setCurrentChecklist( siteSlug: string, checklist_slug: string ) {
	const requestUrl = `/sites/${ siteSlug }/launchpad/navigator`;
	const body = {
		current_checklist: checklist_slug,
	};

	const response: UpdateLaunchpadNavigatorResponse = canAccessWpcomApis()
		? yield wpcomRequest( {
				path: requestUrl,
				apiNamespace: 'wpcom/v2',
				method: 'PUT',
				body,
		  } )
		: yield apiFetch( {
				global: true,
				path: `/wpcom/v2${ requestUrl }`,
				method: 'PUT',
				data: body,
		  } as APIFetchOptions );

	return receiveCurrentChecklist( response.current_checklist );
}

export type LaunchpadNavigatorAction =
	| ReturnType< typeof receiveCurrentChecklist >
	| GeneratorReturnType< typeof setCurrentChecklist >;
