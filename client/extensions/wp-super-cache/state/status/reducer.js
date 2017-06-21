/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';

import { itemsSchema } from './schema';
import {
	WP_SUPER_CACHE_RECEIVE_STATUS,
	WP_SUPER_CACHE_REQUEST_STATUS,
	WP_SUPER_CACHE_REQUEST_STATUS_FAILURE,
} from '../action-types';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a notices request is in progress for a site.
 *
 * @param  {Object} state Current requesting state
 * @param  {Object} action Action object
 * @return {Object} Updated requesting state
 */
const requesting = createReducer( {}, {
	[ WP_SUPER_CACHE_RECEIVE_STATUS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_SUPER_CACHE_REQUEST_STATUS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_SUPER_CACHE_REQUEST_STATUS_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Tracks the notices for a particular site.
 *
 * @param  {Object} state Current notices
 * @param  {Object} action Action object
 * @return {Object} Updated notices
 */
const items = createReducer( {}, {
	[ WP_SUPER_CACHE_RECEIVE_STATUS ]: ( state, action ) => ( { ...state, [ action.siteId ]: action.notices } ),
}, itemsSchema );

export default combineReducers( {
	items,
	requesting,
} );
