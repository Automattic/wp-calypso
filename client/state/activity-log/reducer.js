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
	RESTORE_REQUEST_FAILED,
	REWIND_ACTIVATE_REQUEST,
	REWIND_ACTIVATE_SUCCESS,
	REWIND_ACTIVATE_FAILED,
	REWIND_DEACTIVATE_REQUEST,
	REWIND_DEACTIVATE_SUCCESS,
	REWIND_DEACTIVATE_FAILED,
	REWIND_STATUS_REQUEST,
	REWIND_STATUS_SUCCESS,
	REWIND_STATUS_FAILED
} from 'state/action-types';

export function requests( state = {}, action ) {
	switch ( action.type ) {
		case REWIND_STATUS_REQUEST:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isRequestingRewindStatus: true }
				)
			} );
		case REWIND_STATUS_SUCCESS:
		case REWIND_STATUS_FAILED:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isRequestingRewindStatus: false }
				)
			} );
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
		case REWIND_ACTIVATE_REQUEST:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isActivatingRewind: true }
				)
			} );
		case REWIND_DEACTIVATE_REQUEST:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isDeactivatingRewind: true }
				)
			} );
		case REWIND_ACTIVATE_SUCCESS:
		case REWIND_ACTIVATE_FAILED:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isActivatingRewind: false }
				)
			} );
		case REWIND_DEACTIVATE_SUCCESS:
		case REWIND_DEACTIVATE_FAILED:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isDeactivatingRewind: false }
				)
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

export function status( state = {}, action ) {
	switch ( action.type ) {
		case REWIND_STATUS_SUCCESS:
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
	items,
	status
} );
