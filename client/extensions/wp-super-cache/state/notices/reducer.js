/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';
import { itemsSchema } from './schema';
import {
	WP_SUPER_CACHE_RECEIVE_NOTICES,
	WP_SUPER_CACHE_REQUEST_NOTICES,
	WP_SUPER_CACHE_REQUEST_NOTICES_FAILURE,
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
	[ WP_SUPER_CACHE_RECEIVE_NOTICES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_SUPER_CACHE_REQUEST_NOTICES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_SUPER_CACHE_REQUEST_NOTICES_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } )
} );

/**
 * Tracks the notices for a particular site.
 *
 * @param  {Object} state Current notices
 * @param  {Object} action Action object
 * @return {Object} Updated notices
 */
const items = createReducer( {}, {
	[ WP_SUPER_CACHE_RECEIVE_NOTICES ]: ( state, action ) => ( { ...state, [ action.siteId ]: action.notices } ),
}, itemsSchema );

export default combineReducers( {
	items,
	requesting,
} );
