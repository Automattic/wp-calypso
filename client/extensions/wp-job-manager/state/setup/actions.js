/**
 * Internal dependencies
 */
import { WP_JOB_MANAGER_CREATE_PAGES, WP_JOB_MANAGER_CREATE_PAGES_ERROR, WP_JOB_MANAGER_WIZARD_NEXT_STEP } from '../action-types';

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
