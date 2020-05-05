/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { NewSiteBlogDetails, NewSiteErrorResponse, SiteDetails } from './types';
import { Action } from './actions';

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
	}
	return state;
};

const newSite = combineReducers( {
	data: newSiteData,
	error: newSiteError,
	isFetching: isFetchingSite,
} );

const reducer = combineReducers( { newSite, sites } );

export type State = ReturnType< typeof reducer >;

export default reducer;
