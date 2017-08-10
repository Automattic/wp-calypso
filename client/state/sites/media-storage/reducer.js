/** @format */
/**
 * External dependencies
 */
import { pick } from 'lodash';

/**
 * Internal dependencies
 */
import {
	SITE_MEDIA_STORAGE_RECEIVE,
	SITE_MEDIA_STORAGE_REQUEST,
	SITE_MEDIA_STORAGE_REQUEST_SUCCESS,
	SITE_MEDIA_STORAGE_REQUEST_FAILURE,
} from 'state/action-types';
import { combineReducers } from 'state/utils';
import { itemsSchema } from './schema';

/**
 * Tracks media-storage information, indexed by site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case SITE_MEDIA_STORAGE_RECEIVE:
			const mediaStorage = pick( action.mediaStorage, [
				'max_storage_bytes',
				'storage_used_bytes',
			] );
			return Object.assign( {}, state, {
				[ action.siteId ]: mediaStorage,
			} );
	}
	return state;
}
items.schema = itemsSchema;

/**
 * Tracks media-storage fetching state, indexed by site ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function fetchingItems( state = {}, action ) {
	switch ( action.type ) {
		case SITE_MEDIA_STORAGE_REQUEST:
		case SITE_MEDIA_STORAGE_REQUEST_SUCCESS:
		case SITE_MEDIA_STORAGE_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ action.siteId ]: action.type === SITE_MEDIA_STORAGE_REQUEST,
			} );
	}
	return state;
}

export default combineReducers( {
	items,
	fetchingItems,
} );
