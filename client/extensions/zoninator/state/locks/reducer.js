/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer, withoutPersistence } from 'calypso/state/utils';
import {
	ZONINATOR_REQUEST_LOCK_ERROR,
	ZONINATOR_RESET_LOCK,
	ZONINATOR_UPDATE_LOCK,
} from '../action-types';

export const blocked = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case ZONINATOR_UPDATE_LOCK:
			return false;
		case ZONINATOR_REQUEST_LOCK_ERROR:
			return true;
	}

	return state;
} );

export const created = withoutPersistence( ( state = 0, action ) => {
	switch ( action.type ) {
		case ZONINATOR_RESET_LOCK: {
			const { time } = action;
			return time;
		}
	}

	return state;
} );

export const expires = withoutPersistence( ( state = 0, action ) => {
	switch ( action.type ) {
		case ZONINATOR_UPDATE_LOCK:
			return action.expires;
	}

	return state;
} );

export const maxLockPeriod = withoutPersistence( ( state = 0, action ) => {
	switch ( action.type ) {
		case ZONINATOR_UPDATE_LOCK:
			return action.maxLockPeriod;
	}

	return state;
} );

export const items = combineReducers( {
	blocked,
	created,
	expires,
	maxLockPeriod,
} );

export default keyedReducer( 'siteId', keyedReducer( 'zoneId', items ) );
