import apiFetch, { type APIFetchOptions } from '@wordpress/api-fetch';
import { select } from '@wordpress/data';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import {
	LAUNCHPAD_NAVIGATOR_RECEIVE_ACTIVE_CHECKLIST_SLUG,
	LAUNCHPAD_NAVIGATOR_REMOVE_CHECKLIST,
	STORE_KEY,
} from './constants';
import type { GeneratorReturnType } from '../mapped-types';

export const receiveActiveChecklistSlug = ( activeChecklistSlug: string | null ) =>
	( {
		type: LAUNCHPAD_NAVIGATOR_RECEIVE_ACTIVE_CHECKLIST_SLUG,
		active_checklist_slug: activeChecklistSlug,
	} ) as const;

export const removeChecklistFromNavigatorList = ( checklist_slug: string ) =>
	( {
		type: LAUNCHPAD_NAVIGATOR_REMOVE_CHECKLIST,
		checklist_slug,
	} ) as const;

export function* setActiveChecklist( siteSlug: string, active_checklist_slug: string | null ) {
	const body = {
		active_checklist_slug,
	};

	// Get the current active_checklist_slug from the Redux state
	const activeChecklistSlug = select( STORE_KEY ).getActiveChecklistSlug();

	if ( activeChecklistSlug !== active_checklist_slug ) {
		if ( canAccessWpcomApis() ) {
			yield wpcomRequest( {
				path: `/sites/${ siteSlug }/launchpad/navigator`,
				apiNamespace: 'wpcom/v2',
				method: 'PUT',
				body,
			} );
		} else {
			yield apiFetch( {
				global: true,
				path: `/wpcom/v2/launchpad/navigator`,
				method: 'PUT',
				data: body,
			} as APIFetchOptions );
		}
	}

	return receiveActiveChecklistSlug( active_checklist_slug );
}

export function* removeNavigatorChecklist( siteSlug: string, remove_checklist_slug: string ) {
	const body = {
		remove_checklist_slug,
	};

	let response: {
		updated: boolean;
		new_active_checklist: string | null;
	};

	if ( canAccessWpcomApis() ) {
		response = yield wpcomRequest( {
			path: `/sites/${ siteSlug }/launchpad/navigator`,
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			body,
		} );
	} else {
		response = yield apiFetch( {
			global: true,
			path: `/wpcom/v2/launchpad/navigator`,
			method: 'POST',
			data: body,
		} as APIFetchOptions );
	}

	receiveActiveChecklistSlug( response.new_active_checklist );

	return removeChecklistFromNavigatorList( remove_checklist_slug );
}

export type LaunchpadNavigatorAction =
	| ReturnType< typeof receiveActiveChecklistSlug | typeof removeChecklistFromNavigatorList >
	| GeneratorReturnType< typeof setActiveChecklist | typeof removeNavigatorChecklist >;
