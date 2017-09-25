/**
 * Internal dependencies
 */
import { WP_JOB_MANAGER_CREATE_PAGES, WP_JOB_MANAGER_CREATE_PAGES_ERROR, WP_JOB_MANAGER_WIZARD_NEXT_STEP } from '../action-types';
import { combineReducers, createReducer } from 'state/utils';

/**
 * Returns the updated creating state after an action has been dispatched.
 * Creating state tracks whether pages are being created for a site.
 *
 * @param  {Object} state Current creating state
 * @param  {Object} action Action object
 * @return {Object} Updated creating state
 */
export const creating = createReducer( {}, {
	[ WP_JOB_MANAGER_CREATE_PAGES ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_JOB_MANAGER_CREATE_PAGES_ERROR ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_JOB_MANAGER_WIZARD_NEXT_STEP ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
} );

/**
 * Tracks whether or not to move to the next step in the wizard.
 *
 * @param  {Object} state Current state
 * @param  {Object} action Action object
 * @return {Object} Updated state
 */
export const nextStep = createReducer( {}, {
	[ WP_JOB_MANAGER_WIZARD_NEXT_STEP ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
} );

export default combineReducers( {
	creating,
	nextStep,
} );
