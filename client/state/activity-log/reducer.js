/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { get, merge } from 'lodash';

/**
 * Internal dependencies
 */
import {
	ACTIVITY_LOG_FETCH,
	ACTIVITY_LOG_FETCH_FAILED,
	ACTIVITY_LOG_FETCH_SUCCESS,
	RESTORE_REQUEST,
	RESTORE_REQUEST_SUCCESS,
	RESTORE_REQUEST_FAILED
} from 'state/action-types';

export function requests( state = {}, action ) {
	switch ( action.type ) {
		case ACTIVITY_LOG_FETCH:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isRequesting: true }
				)
			} );
		case ACTIVITY_LOG_FETCH_SUCCESS:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isRequesting: false }
				)
			} );
		case ACTIVITY_LOG_FETCH_FAILED:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isRequesting: false }
				)
			} );
		case RESTORE_REQUEST:
			return merge( {}, state, {
				[ action.siteId ]: {
					isRestoring: action.timestamp
				}
			} );
		case RESTORE_REQUEST_SUCCESS:
		case RESTORE_REQUEST_FAILED:
			return merge( {}, state, {
				[ action.siteId ]: {
					isRestoring: ''
				}
			} );
	}
	return state;
}

export function items( state = {}, action ) {
	switch ( action.type ) {
		case ACTIVITY_LOG_FETCH_SUCCESS:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					{ data: action.data }
				)
			} );
	}
	return state;
}

export default combineReducers( {
	requests,
	items
} );
