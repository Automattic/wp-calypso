/* eslint-disable no-case-declarations */
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
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { itemsSchema } from './schema';

/**
 * Tracks media-storage information, indexed by site ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
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
} );

/**
 * Tracks media-storage fetching state, indexed by site ID.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
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
