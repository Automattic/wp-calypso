/**
 * Internal dependencies
 */
import {
	HELP_CONTACT_FORM_SITE_SELECT,
	HELP_LINKS_RECEIVE,
	SUPPORT_HISTORY_SET,
	SUPPORT_LEVEL_SET,
} from 'calypso/state/action-types';
import courses from './courses/reducer';
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import directly from './directly/reducer';
import ticket from './ticket/reducer';

/**
 * Tracks the site id for the selected site in the help/contact form
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const selectedSiteId = ( state = null, action ) => {
	switch ( action.type ) {
		case HELP_CONTACT_FORM_SITE_SELECT:
			return action.siteId;
	}

	return state;
};

/**
 * Responsible for the help search results links
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const links = ( state = {}, action ) => {
	switch ( action.type ) {
		case HELP_LINKS_RECEIVE:
			return action.helpLinks;
		default:
			return state;
	}
};

/**
 * Responsible for the help search results links
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const supportHistory = ( state = [], { type, items } ) => {
	switch ( type ) {
		case SUPPORT_HISTORY_SET:
			return items;
		default:
			return state;
	}
};

/**
 * The level of support we're offering to this user (represents their highest paid plan).
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const supportLevel = ( state = null, { type, level } ) => {
	switch ( type ) {
		case SUPPORT_LEVEL_SET:
			return level;
		default:
			return state;
	}
};

const combinedReducer = combineReducers( {
	courses,
	directly,
	links,
	ticket,
	selectedSiteId,
	supportHistory,
	supportLevel,
} );

export default withStorageKey( 'help', combinedReducer );
