/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { createSectionReducer } from './utils';

/**
 * Returns the updated section name state after an action has been dispatched.
 * The state reflects the current section name.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const name = createSectionReducer( null, 'name' );

/**
 * Returns the updated section paths state after an action has been dispatched.
 * The state reflects the set of path fragments matched by the current section.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const paths = createSectionReducer( [], 'paths' );

/**
 * Returns the updated section module state after an action has been
 * dispatched. The state reflects the Node module to be required in
 * navigating to the section.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
const moduleReducer = createSectionReducer( null, 'module' );
export { moduleReducer as module };

/**
 * Returns the updated section logged-out enabled state after an action has
 * been dispatched. The state reflects whether the section is available for
 * logged-out usage.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const enableLoggedOut = createSectionReducer( false, 'enableLoggedOut' );

/**
 * Returns the updated section secondary state after an action has been
 * dispatched. The state reflects whether the secondary (sidebar) element
 * should be present while this section is active.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const secondary = createSectionReducer( false, 'secondary' );

/**
 * Returns the updated section group state after an action has been dispatched.
 * The state reflects a group of sections to which the current section belongs.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const group = createSectionReducer( null, 'group' );

/**
 * Returns the updated section isomorphic state after an action has been
 * dispatched. The state reflects whether the current section supports
 * server-side rendering.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const isomorphic = createSectionReducer( false, 'isomorphic' );

/**
 * Returns the updated section title state after an action has been dispatched.
 * The state reflects the title to be shown in server-side rendered layouts.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const title = createSectionReducer( null, 'title' );

export default combineReducers( {
	name,
	paths,
	module: moduleReducer,
	enableLoggedOut,
	secondary,
	group,
	isomorphic,
	title
} );
