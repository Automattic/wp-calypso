/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_REQUEST_PAGES,
	WP_JOB_MANAGER_REQUEST_PAGES_ERROR,
	WP_JOB_MANAGER_UPDATE_PAGES,
} from '../action-types';

/**
 * Returns an action object to indicate that a request has been made to fetch the pages.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const requestPages = siteId => ( { type: WP_JOB_MANAGER_REQUEST_PAGES, siteId } );

/**
 * Returns an action object to indicate that an error was received when requesting the pages.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const requestPagesError = siteId => ( { type: WP_JOB_MANAGER_REQUEST_PAGES_ERROR, siteId } );

/**
 * Returns an action object to indicate that the pages should be updated.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} data Published pages
 * @return {Object} Action object
 */
export const updatePages = ( siteId, data ) => ( { type: WP_JOB_MANAGER_UPDATE_PAGES, siteId, data } );
