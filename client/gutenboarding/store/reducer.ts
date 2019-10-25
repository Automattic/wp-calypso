/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, SiteType } from './types';
import * as Actions from './actions';

const siteType: Reducer< SiteType, ReturnType< typeof Actions[ 'setSiteType' ] > > = (
	state = SiteType.BLOG,
	action
) => {
	switch ( action.type ) {
		case ActionType.SET_SITE_TYPE:
			return action.siteType;
	}
	return state;
};

const siteTitle: Reducer< string, ReturnType< typeof Actions[ 'setSiteTitle' ] > > = (
	state = '',
	action
) => {
	switch ( action.type ) {
		case ActionType.SET_SITE_TITLE:
			return action.siteTitle;
	}
	return state;
};

const reducer = combineReducers( { siteType, siteTitle } );

export type State = ReturnType< typeof reducer >;

export default reducer;
