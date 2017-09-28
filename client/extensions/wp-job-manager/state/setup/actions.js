/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_CREATE_PAGES,
	WP_JOB_MANAGER_CREATE_PAGES_ERROR,
	WP_JOB_MANAGER_FETCH_SETUP_STATUS,
	WP_JOB_MANAGER_FETCH_SETUP_STATUS_ERROR,
	WP_JOB_MANAGER_UPDATE_SETUP_STATUS,
	WP_JOB_MANAGER_WIZARD_NEXT_STEP,
} from '../action-types';

/**
 * Returns an action object to indicate that the pages should be created.
 *
 * @param  {Number} siteId Site ID
 * @param  {Array}  titles Page titles
 * @return {Object} Action object
 */
export const createPages = ( siteId, titles ) => ( { type: WP_JOB_MANAGER_CREATE_PAGES, siteId, titles } );

/**
 * Returns an action object to indicate that an error was received when creating the pages.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const createPagesError = siteId => ( { type: WP_JOB_MANAGER_CREATE_PAGES_ERROR, siteId } );

/**
 * Returns an action object to indicate that the wizard should advance to the next step.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const nextStep = siteId => ( { type: WP_JOB_MANAGER_WIZARD_NEXT_STEP, siteId } );

/**
 * Returns an action object to indicate that a request has been made to fetch the setup status.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const fetchSetupStatus = siteId => ( { type: WP_JOB_MANAGER_FETCH_SETUP_STATUS, siteId } );

/**
 * Returns an action object to indicate that an error was received when fetching the setup status.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const fetchSetupStatusError = siteId => ( { type: WP_JOB_MANAGER_FETCH_SETUP_STATUS_ERROR, siteId } );

/**
 * Returns an action object to indicate that the setup status should be updated.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} setupStatus Setup status
 * @return {Object} Action object
 */
export const updateSetupStatus = ( siteId, setupStatus ) => ( { type: WP_JOB_MANAGER_UPDATE_SETUP_STATUS, siteId, setupStatus } );
