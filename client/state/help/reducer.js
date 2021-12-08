import { withStorageKey } from '@automattic/state-utils';
import { HELP_CONTACT_FORM_SITE_SELECT, SUPPORT_HISTORY_SET } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import courses from './courses/reducer';
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
 * @param {object} state  Current state
 * @param {object} action Action payload
 * @param action.type
 * @param action.items
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

const combinedReducer = combineReducers( {
	courses,
	directly,
	ticket,
	selectedSiteId,
	supportHistory,
} );

export default withStorageKey( 'help', combinedReducer );
