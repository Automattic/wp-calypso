/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'client/state/utils';
import {
	WP_JOB_MANAGER_CREATE_PAGES,
	WP_JOB_MANAGER_CREATE_PAGES_ERROR,
	WP_JOB_MANAGER_FETCH_SETUP_STATUS,
	WP_JOB_MANAGER_FETCH_SETUP_STATUS_ERROR,
	WP_JOB_MANAGER_UPDATE_SETUP_STATUS,
	WP_JOB_MANAGER_WIZARD_NEXT_STEP,
} from '../action-types';

/**
 * Returns the updated creating state after an action has been dispatched.
 * Creating state tracks whether pages are being created for a site.
 *
 * @param  {Boolean} state Current creating state
 * @param  {Object}  action Action object
 * @return {Object}  Updated creating state
 */
export const creating = ( state = false, { type } ) => {
	switch ( type ) {
		case WP_JOB_MANAGER_CREATE_PAGES:
			return true;

		case WP_JOB_MANAGER_CREATE_PAGES_ERROR:
		case WP_JOB_MANAGER_WIZARD_NEXT_STEP:
			return false;

		default:
			return state;
	}
};

/**
 * Returns the updated fetching state after an action has been dispatched.
 * Fetching state tracks whether setup status is being fetched for a site.
 *
 * @param  {Boolean} state Current fetching state
 * @param  {Object}  action Action object
 * @return {Object}  Updated fetching state
 */
export const fetching = ( state = false, { type } ) => {
	switch ( type ) {
		case WP_JOB_MANAGER_FETCH_SETUP_STATUS:
			return true;

		case WP_JOB_MANAGER_FETCH_SETUP_STATUS_ERROR:
		case WP_JOB_MANAGER_UPDATE_SETUP_STATUS:
			return false;

		default:
			return state;
	}
};

/**
 * Tracks whether or not to move to the next step in the wizard.
 *
 * @param  {Boolean} state Current state
 * @param  {Object}  action Action object
 * @return {Object}  Updated state
 */
export const nextStep = ( state = false, { type } ) =>
	WP_JOB_MANAGER_WIZARD_NEXT_STEP === type ? true : state;

/**
 * Tracks the setup status for a particular site.
 *
 * @param  {Boolean} state Current setup status
 * @param  {Object}  action Action object
 * @return {Object}  Updated setup status
 */
export const status = ( state = false, { setupStatus, type } ) =>
	WP_JOB_MANAGER_UPDATE_SETUP_STATUS === type ? setupStatus : state;

export default keyedReducer(
	'siteId',
	combineReducers( {
		creating,
		fetching,
		nextStep,
		status,
	} )
);
