/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import {
	WP_JOB_MANAGER_REQUEST_PAGES,
	WP_JOB_MANAGER_REQUEST_PAGES_ERROR,
	WP_JOB_MANAGER_UPDATE_PAGES,
} from '../action-types';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether the pages for a site are being fetched.
 *
 * @param  {Object} state Current requesting state
 * @param  {Object} action Action object
 * @return {Object} Updated requesting state
 */
export const requesting = createReducer( {}, {
	[ WP_JOB_MANAGER_REQUEST_PAGES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_JOB_MANAGER_REQUEST_PAGES_ERROR ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_JOB_MANAGER_UPDATE_PAGES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
} );

/**
 * Tracks the pages for a particular site.
 *
 * @param  {Object} state Current pages
 * @param  {Object} action Action object
 * @return {Object} Updated pages
 */
export const items = createReducer( {}, {
	[ WP_JOB_MANAGER_UPDATE_PAGES ]: ( state, { siteId, data } ) => ( { ...state, [ siteId ]: data } ),
} );

export default combineReducers( {
	items,
	requesting,
} );
