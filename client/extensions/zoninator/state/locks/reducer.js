/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	ZONINATOR_REQUEST_LOCK,
	ZONINATOR_REQUEST_LOCK_ERROR,
	ZONINATOR_UPDATE_LOCK,
} from '../action-types';

const isRequesting = createReducer(
	{},
	{
		[ ZONINATOR_REQUEST_LOCK ]: () => true,
		[ ZONINATOR_REQUEST_LOCK_ERROR ]: () => false,
		[ ZONINATOR_UPDATE_LOCK ]: () => false,
	}
);

export const requesting = keyedReducer( 'siteId', keyedReducer( 'zoneId', isRequesting ) );

const isBlocked = createReducer(
	{},
	{
		[ ZONINATOR_UPDATE_LOCK ]: () => false,
		[ ZONINATOR_REQUEST_LOCK_ERROR ]: ( state, { blocked } ) => blocked,
	}
);

export const blocked = keyedReducer( 'siteId', keyedReducer( 'zoneId', isBlocked ) );

const lockInit = createReducer(
	{},
	{
		[ ZONINATOR_UPDATE_LOCK ]: ( state, { reset } ) => ( reset ? new Date().getTime() : state ),
	}
);

export const created = keyedReducer( 'siteId', keyedReducer( 'zoneId', lockInit ) );

const lock = createReducer(
	{},
	{
		[ ZONINATOR_UPDATE_LOCK ]: ( state, { expires } ) => expires,
	}
);

export const items = keyedReducer( 'siteId', keyedReducer( 'zoneId', lock ) );

const lockSettings = createReducer(
	{},
	{
		[ ZONINATOR_UPDATE_LOCK ]: ( state, { maxLockPeriod } ) => maxLockPeriod,
	}
);

export const maxLockPeriod = keyedReducer( 'siteId', lockSettings );

export default combineReducers( {
	requesting,
	blocked,
	created,
	items,
	maxLockPeriod,
} );
