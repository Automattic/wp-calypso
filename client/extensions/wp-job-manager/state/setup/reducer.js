/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
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
 * Returns the updated fetching state after an action has been dispatched.
 * Fetching state tracks whether setup status is being fetched for a site.
 *
 * @param  {Object} state Current fetching state
 * @param  {Object} action Action object
 * @return {Object} Updated fetching state
 */
export const fetching = createReducer( {}, {
	[ WP_JOB_MANAGER_FETCH_SETUP_STATUS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ WP_JOB_MANAGER_FETCH_SETUP_STATUS_ERROR ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ WP_JOB_MANAGER_UPDATE_SETUP_STATUS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
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

/**
 * Tracks the setup status for a particular site.
 *
 * @param  {Object} state Current setup status
 * @param  {Object} action Action object
 * @return {Object} Updated setup status
 */
export const status = createReducer( {}, {
	[ WP_JOB_MANAGER_UPDATE_SETUP_STATUS ]: ( state, { siteId, setupStatus } ) => ( { ...state, [ siteId ]: setupStatus } ),
} );

export default combineReducers( {
	creating,
	fetching,
	nextStep,
	status,
} );
