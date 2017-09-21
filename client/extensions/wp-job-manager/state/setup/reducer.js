/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import {
	WP_JOB_MANAGER_CREATE_PAGES,
	WP_JOB_MANAGER_CREATE_PAGES_ERROR,
	WP_JOB_MANAGER_WIZARD_NEXT_STEP,
} from '../action-types';

/**
 * Returns the updated creating state after an action has been dispatched.
 * Creating state tracks whether pages are being created for a site.
 *
 * @param  {Object} state Current creating state
 * @param  {Object} action Action object
 * @return {Object} Updated creating state
 */
export const creating = ( state = false, { type } ) => get( {
	[ WP_JOB_MANAGER_CREATE_PAGES ]: true,
	[ WP_JOB_MANAGER_CREATE_PAGES_ERROR ]: false,
	[ WP_JOB_MANAGER_WIZARD_NEXT_STEP ]: false,
}, type, state );

/**
 * Tracks whether or not to move to the next step in the wizard.
 *
 * @param  {Object} state Current state
 * @param  {Object} action Action object
 * @return {Object} Updated state
 */
export const nextStep = ( state = false, { type } ) =>
	WP_JOB_MANAGER_WIZARD_NEXT_STEP === type
		? true
		: state;

export default keyedReducer( 'siteId', combineReducers( {
	creating,
	nextStep,
} ) );
