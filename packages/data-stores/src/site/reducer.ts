/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import {
	NewSiteBlogDetails,
	NewSiteErrorResponse,
	SiteDetails,
	Domain,
	SiteLaunchState,
	SiteLaunchStatus,
	SiteLaunchError,
} from './types';
import type { Action } from './actions';

export const newSiteData: Reducer< NewSiteBlogDetails | undefined, Action > = ( state, action ) => {
	if ( action.type === 'RECEIVE_NEW_SITE' ) {
		const { response } = action;
		return response.blog_details;
	} else if ( action.type === 'RECEIVE_NEW_SITE_FAILED' ) {
		return undefined;
	} else if ( action.type === 'RESET_SITE_STORE' ) {
		return undefined;
	}
	return state;
};

export const newSiteError: Reducer< NewSiteErrorResponse | undefined, Action > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'FETCH_NEW_SITE':
		case 'RECEIVE_NEW_SITE':
		case 'RESET_SITE_STORE':
		case 'RESET_RECEIVE_NEW_SITE_FAILED':
			return undefined;
		case 'RECEIVE_NEW_SITE_FAILED':
			return {
				error: action.error.error,
				status: action.error.status,
				statusCode: action.error.statusCode,
				name: action.error.name,
				message: action.error.message,
			};
	}
	return state;
};

export const isFetchingSite: Reducer< boolean | undefined, Action > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'FETCH_NEW_SITE':
			return true;
		case 'RECEIVE_NEW_SITE':
		case 'RECEIVE_NEW_SITE_FAILED':
		case 'RESET_SITE_STORE':
		case 'RESET_RECEIVE_NEW_SITE_FAILED':
			return false;
	}
	return state;
};

export const isFetchingSiteDetails: Reducer< boolean | undefined, Action > = (
	state = false,
	action
) => {
	switch ( action.type ) {
		case 'FETCH_SITE':
			return true;
		case 'RECEIVE_SITE':
		case 'RECEIVE_SITE_FAILED':
			return false;
	}
	return state;
};

export const sites: Reducer< { [ key: number ]: SiteDetails | undefined }, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_SITE' ) {
		return { ...state, [ action.siteId ]: action.response };
	} else if ( action.type === 'RECEIVE_SITE_FAILED' ) {
		const { [ action.siteId ]: idToBeRemoved, ...remainingState } = state;
		return { ...remainingState };
	} else if ( action.type === 'RESET_SITE_STORE' ) {
		return {};
	} else if ( action.type === 'RECEIVE_SITE_TITLE' ) {
		return {
			...state,
			[ action.siteId ]: { ...( state[ action.siteId ] as SiteDetails ), name: action.title },
		};
	}
	return state;
};

export const sitesDomains: Reducer< { [ key: number ]: Domain[] }, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'RECEIVE_SITE_DOMAINS' ) {
		return { ...state, [ action.siteId ]: action.domains };
	}
	return state;
};

export const launchStatus: Reducer< { [ key: number ]: SiteLaunchState }, Action > = (
	state = {},
	action
) => {
	if ( action.type === 'LAUNCH_SITE_START' ) {
		return {
			...state,
			[ action.siteId ]: { status: SiteLaunchStatus.IDLE, errorCode: undefined },
		};
	}
	if ( action.type === 'LAUNCH_SITE_COMPLETE' ) {
		return {
			...state,
			[ action.siteId ]: { status: SiteLaunchStatus.SUCCESS, errorCode: undefined },
		};
	}
	if ( action.type === 'LAUNCH_SITE_ERROR' ) {
		return {
			...state,
			[ action.siteId ]: {
				status: SiteLaunchStatus.FAILURE,
				errorCode: SiteLaunchError.INTERNAL,
			},
		};
	}
	return state;
};

const newSite = combineReducers( {
	data: newSiteData,
	error: newSiteError,
	isFetching: isFetchingSite,
} );

const reducer = combineReducers( {
	isFetchingSiteDetails,
	newSite,
	sites,
	launchStatus,
	sitesDomains,
} );

export type State = ReturnType< typeof reducer >;

export default reducer;
