/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	ACTIVITY_LOG_FETCH,
	ACTIVITY_LOG_FETCH_FAILED,
	ACTIVITY_LOG_FETCH_SUCCESS
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
					{ isRequesting: false },
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

export default combineReducers( {
	requests,
	items
} );
