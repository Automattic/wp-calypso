/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, NewSite, NewSiteErrorResponse } from './types';
import * as Actions from './actions';

const newSiteData: Reducer<
	NewSite | {} | undefined,
	| ReturnType< typeof Actions[ 'receiveNewSite' ] >
	| ReturnType< typeof Actions[ 'receiveNewSiteFailed' ] >
> = ( state = undefined, action ) => {
	if ( action.type === ActionType.RECEIVE_NEW_SITE ) {
		const { response } = action;
		return {
			...response.blog_details,
		};
	} else if ( action.type === ActionType.RECEIVE_NEW_SITE_FAILED ) {
		return undefined;
	}
	return state;
};

const newSiteError: Reducer<
	NewSiteErrorResponse | undefined,
	| ReturnType< typeof Actions[ 'fetchNewSite' ] >
	| ReturnType< typeof Actions[ 'receiveNewSite' ] >
	| ReturnType< typeof Actions[ 'receiveNewSiteFailed' ] >
> = ( state = undefined, action ) => {
	switch ( action.type ) {
		case ActionType.FETCH_NEW_SITE:
			return undefined;
		case ActionType.RECEIVE_NEW_SITE:
			return undefined;
		case ActionType.RECEIVE_NEW_SITE_FAILED:
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

const isFetchingNewUser: Reducer<
	boolean | undefined,
	| ReturnType< typeof Actions[ 'fetchNewSite' ] >
	| ReturnType< typeof Actions[ 'receiveNewSite' ] >
	| ReturnType< typeof Actions[ 'receiveNewSiteFailed' ] >
> = ( state = false, action ) => {
	switch ( action.type ) {
		case ActionType.FETCH_NEW_SITE:
			return true;
		case ActionType.RECEIVE_NEW_SITE:
			return false;
		case ActionType.RECEIVE_NEW_SITE_FAILED:
			return false;
	}
	return state;
};

const newSite = combineReducers( {
	data: newSiteData,
	error: newSiteError,
	isFetching: isFetchingNewUser,
} );

const reducer = combineReducers( { newSite } );

export type State = ReturnType< typeof reducer >;

export default reducer;
