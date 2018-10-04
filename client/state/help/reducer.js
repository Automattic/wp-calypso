/** @format */

/**
 * Internal dependencies
 */
import { HELP_CONTACT_FORM_SITE_SELECT, HELP_LINKS_RECEIVE } from 'state/action-types';
import courses from './courses/reducer';
import { combineReducers, createReducer } from 'state/utils';
import directly from './directly/reducer';
import ticket from './ticket/reducer';

/**
 * Tracks the site id for the selected site in the help/contact form
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const selectedSiteId = createReducer( null, {
	[ HELP_CONTACT_FORM_SITE_SELECT ]: ( state, action ) => action.siteId,
} );

/**
 * Responsible for the help search results links
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const links = ( state = {}, action ) => {
	switch ( action.type ) {
		case HELP_LINKS_RECEIVE:
			return action.helpLinks;
		default:
			return state;
	}
};

export default combineReducers( {
	courses,
	directly,
	links,
	ticket,
	selectedSiteId,
} );
