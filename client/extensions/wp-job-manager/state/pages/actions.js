/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_FETCH_PAGES,
	WP_JOB_MANAGER_FETCH_PAGES_ERROR,
	WP_JOB_MANAGER_UPDATE_PAGES,
} from '../action-types';

/**
 * Returns an action object to indicate that a request has been made to fetch the pages.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const fetchPages = siteId => ( { type: WP_JOB_MANAGER_FETCH_PAGES, siteId } );

/**
 * Returns an action object to indicate that an error was received when fetching the pages.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const fetchPagesError = siteId => ( { type: WP_JOB_MANAGER_FETCH_PAGES_ERROR, siteId } );

/**
 * Returns an action object to indicate that the pages should be updated.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} data Published pages
 * @return {Object} Action object
 */
export const updatePages = ( siteId, data ) => ( { type: WP_JOB_MANAGER_UPDATE_PAGES, siteId, data } );
