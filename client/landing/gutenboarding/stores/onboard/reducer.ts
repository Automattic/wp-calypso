/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, FormValue, SiteType, EMPTY_FORM_VALUE, Vertical, SiteVertical } from './types';
import * as Actions from './actions';

const siteType: Reducer<
	FormValue< SiteType >,
	ReturnType< typeof Actions[ 'resetSiteType' ] > | ReturnType< typeof Actions[ 'setSiteType' ] >
> = ( state = EMPTY_FORM_VALUE, action ) => {
	if ( action.type === ActionType.RESET_SITE_TYPE ) {
		return EMPTY_FORM_VALUE;
	}
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

const verticals: Reducer< Vertical[], ReturnType< typeof Actions[ 'receiveVerticals' ] > > = (
	state = [],
	action
) => {
	if ( action.type === ActionType.RECEIVE_VERTICALS ) {
		return action.verticals;
	}
	return state;
};

const siteVertical: Reducer<
	FormValue< SiteVertical >,
	ReturnType< typeof Actions[ 'setSiteVertical' ] >
> = ( state = EMPTY_FORM_VALUE, action ) => {
	if ( action.type === ActionType.SET_SITE_VERTICAL ) {
		return action.siteVertical;
	}
	return state;
};

const reducer = combineReducers( { siteType, siteTitle, verticals, siteVertical } );

export type State = ReturnType< typeof reducer >;

export default reducer;
