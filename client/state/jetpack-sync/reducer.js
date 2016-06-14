/**
 * External dependencis
 */
import { combineReducers } from 'redux';
import pick from 'lodash/pick';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import {
	JETPACK_SYNC_START_REQUEST,
	JETPACK_SYNC_START_SUCCESS,
	JETPACK_SYNC_START_ERROR,
	JETPACK_SYNC_STATUS_REQUEST,
	JETPACK_SYNC_STATUS_SUCCESS,
	JETPACK_SYNC_STATUS_ERROR,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { getExpectedResponseKeys } from './utils';

export function fullSyncRequest( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_SYNC_START_REQUEST:
			return Object.assign( {}, state, {
				[ action.siteId ]: { isRequesting: true, lastRequested: Date.now() }
			} );
		case JETPACK_SYNC_START_SUCCESS:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isRequesting: false, scheduled: get( action, 'data.scheduled' ), error: false },
				)
			} );
		case JETPACK_SYNC_START_ERROR:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isRequesting: false, scheduled: false, error: action.error },
				)
			} );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export function syncStatus( state = {}, action ) {
	switch ( action.type ) {
		case JETPACK_SYNC_START_REQUEST:
			return Object.assign( {}, state, {
				[ action.siteId ]: {}
			} );
		case JETPACK_SYNC_STATUS_REQUEST:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isRequesting: true },
				)
			} );
		case JETPACK_SYNC_STATUS_SUCCESS:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{
						isRequesting: false,
						error: false,
						lastSuccessfulStatus: Date.now()
					},
					pick( action.data, getExpectedResponseKeys() )
				)
			} );
		case JETPACK_SYNC_STATUS_ERROR:
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{ isRequesting: false, error: action.error },
					pick( action.data, getExpectedResponseKeys() )
				)
			} );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	syncStatus,
	fullSyncRequest
} );
