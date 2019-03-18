/** @format */
/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import { PLUGINS_RECOMMENDED_REQUEST, PLUGINS_RECOMMENDED_RECEIVE } from 'state/action-types';

export const items = keyedReducer( 'siteId', ( state = [], action ) => {
	switch ( action.type ) {
		case PLUGINS_RECOMMENDED_RECEIVE: {
			return action.data;
		}
	}
	return state;
} );

export const isRequesting = ( state = {}, action ) => {
	switch ( action.type ) {
		case PLUGINS_RECOMMENDED_REQUEST: {
			return { ...state, [ action.siteId ]: true };
		}
		case PLUGINS_RECOMMENDED_RECEIVE: {
			return { ...state, [ action.siteId ]: false };
		}
	}
	return state;
};

export default combineReducers( { items, isRequesting } );
