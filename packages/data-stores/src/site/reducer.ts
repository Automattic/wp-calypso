/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { NewSite, NewSiteErrorResponse } from './types';
import { Action } from './actions';

const newSiteData: Reducer< NewSite | {} | undefined, Action > = ( state, action ) => {
	if ( action.type === 'RECEIVE_NEW_SITE' ) {
		const { response } = action;
		return {
			...response.blog_details,
		};
	} else if ( action.type === 'RECEIVE_NEW_SITE_FAILED' ) {
		return undefined;
	}
	return state;
};

const newSiteError: Reducer< NewSiteErrorResponse | undefined, Action > = ( state, action ) => {
	switch ( action.type ) {
		case 'FETCH_NEW_SITE':
			return undefined;
		case 'RECEIVE_NEW_SITE':
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

const isFetchingSite: Reducer< boolean | undefined, Action > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'FETCH_NEW_SITE':
			return true;
		case 'RECEIVE_NEW_SITE':
			return false;
		case 'RECEIVE_NEW_SITE_FAILED':
			return false;
	}
	return state;
};

const newSite = combineReducers( {
	data: newSiteData,
	error: newSiteError,
	isFetching: isFetchingSite,
} );

const reducer = combineReducers( { newSite } );

export type State = ReturnType< typeof reducer >;

export default reducer;
