/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import { RECOMMENDED_PLUGINS_REQUEST, RECOMMENDED_PLUGINS_RECEIVE } from 'state/action-types';

export const items = keyedReducer( 'siteId', ( state = [], action ) => {
	switch ( action.type ) {
		case RECOMMENDED_PLUGINS_RECEIVE: {
			return action.data;
		}
	}
	return state;
} );

export const isRequesting = ( state = {}, action ) => {
	switch ( action.type ) {
		case RECOMMENDED_PLUGINS_REQUEST: {
			return { ...state, [ action.siteId ]: true };
		}
		case RECOMMENDED_PLUGINS_RECEIVE: {
			return { ...state, [ action.siteId ]: false };
		}
	}
	return state;
};

export default combineReducers( { items, isRequesting } );
