/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, FormValue, SiteType, UNKNOWN_FORM_VALUE, Vertical } from './types';
import * as Actions from './actions';

const siteType: Reducer< FormValue< SiteType >, ReturnType< typeof Actions[ 'setSiteType' ] > > = (
	state = UNKNOWN_FORM_VALUE,
	action
) => {
	if ( action.type === ActionType.SET_SITE_TYPE ) {
		return action.siteType;
	}
	return state;
};

const siteTitle: Reducer< string, ReturnType< typeof Actions[ 'setSiteTitle' ] > > = (
	state = '',
	action
) => {
	if ( action.type === ActionType.SET_SITE_TITLE ) {
		return action.siteTitle;
	}
	return state;
};

// @TODO Normalize data: searches are lists of ids, ids stored in a map
const verticalSearches: Reducer<
	Record< string, Vertical[] >,
	ReturnType< typeof Actions[ 'receiveVertical' ] >
> = ( state = {}, action ) => {
	if ( action.type === ActionType.RECEIVE_VERTICAL ) {
		return {
			...state,
			[ action.search ]: action.verticals,
		};
	}
	return state;
};

const reducer = combineReducers( { siteType, siteTitle, verticalSearches } );

export type State = ReturnType< typeof reducer >;

export default reducer;
