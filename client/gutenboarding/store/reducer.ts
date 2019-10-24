/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import ActionTypes from './action-types';
import { SetSiteTypeAction } from './actions';

const siteType: Reducer< null | SetSiteTypeAction[ 'siteType' ], SetSiteTypeAction > = (
	state = null,
	action
) => {
	switch ( action.type ) {
		case ActionTypes.SET_SITE_TYPE:
			return action.siteType;
	}
	return state;
};

const reducer = combineReducers( { siteType } );

export type State = ReturnType< typeof reducer >;

export default reducer;
