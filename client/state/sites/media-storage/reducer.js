/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import pick from 'lodash/pick';

/**
 * Internal dependencies
 */
import {
	SITE_MEDIA_STORAGE_RECEIVE,
	SITE_MEDIA_STORAGE_REQUEST,
	SITE_MEDIA_STORAGE_REQUEST_SUCCESS,
	SITE_MEDIA_STORAGE_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { itemsSchema } from './schema';
import { isValidStateWithSchema } from 'state/utils';

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
			const mediaStorage = pick( action.mediaStorage, [ 'max_storage_bytes', 'storage_used_bytes' ] );
			return Object.assign( {}, state, {
				[ action.siteId ]: mediaStorage
			} );
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			if ( isValidStateWithSchema( state, itemsSchema ) ) {
				return state;
			}
			return {};
	}
	return state;
}

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
				[ action.siteId ]: action.type === SITE_MEDIA_STORAGE_REQUEST
			} );
		case SERIALIZE:
			return {};
		case DESERIALIZE:
			return {};
	}
	return state;
}

export default combineReducers( {
	items,
	fetchingItems
} );
