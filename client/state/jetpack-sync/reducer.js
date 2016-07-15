/**
 * External dependencis
 */
import { combineReducers } from 'redux';
import { pick, get } from 'lodash';

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
				[ action.siteId ]: Object.assign(
					{},
					get( state, [ action.siteId ], {} ),
					{ isRequesting: true, scheduled: false, lastRequested: Date.now() },
				)
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
			const thisState = get( state, [ action.siteId ], {} );

			// lastSuccessfulStatus is any status after we have started sycing
			let lastSuccessfulStatus = get( thisState, 'lastSuccessfulStatus', false );
			const isFullSyncing = ( get( action, 'data.started' ) && ! get( action, 'data.finished' ) );
			if ( lastSuccessfulStatus || isFullSyncing ) {
				lastSuccessfulStatus = Date.now();
			}
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{
						isRequesting: false,
						error: false,
						lastSuccessfulStatus,
						errorCounter: 0
					},
					pick( action.data, getExpectedResponseKeys() )
				)
			} );
		case JETPACK_SYNC_STATUS_ERROR:
			const errorCounter = get( state, [ action.siteId, 'errorCounter' ], 0 );
			return Object.assign( {}, state, {
				[ action.siteId ]: Object.assign(
					{
						isRequesting: false,
						error: action.error,
						errorCounter: errorCounter + 1
					},
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
