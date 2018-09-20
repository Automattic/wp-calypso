/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	ZONINATOR_REQUEST_LOCK_ERROR,
	ZONINATOR_RESET_LOCK,
	ZONINATOR_UPDATE_LOCK,
} from '../action-types';

export const blocked = createReducer( false, {
	[ ZONINATOR_UPDATE_LOCK ]: () => false,
	[ ZONINATOR_REQUEST_LOCK_ERROR ]: () => true,
} );

export const created = createReducer( 0, {
	[ ZONINATOR_RESET_LOCK ]: ( state, { time } ) => time,
} );

export const expires = createReducer( 0, {
	[ ZONINATOR_UPDATE_LOCK ]: ( state, action ) => action.expires,
} );

export const maxLockPeriod = createReducer( 0, {
	[ ZONINATOR_UPDATE_LOCK ]: ( state, action ) => action.maxLockPeriod,
} );

export const items = combineReducers( {
	blocked,
	created,
	expires,
	maxLockPeriod,
} );

export default keyedReducer( 'siteId', keyedReducer( 'zoneId', items ) );
