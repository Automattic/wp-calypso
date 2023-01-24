import { withStorageKey } from '@automattic/state-utils';
import { HELP_CONTACT_FORM_SITE_SELECT } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
import ticket from './ticket/reducer';

/**
 * Tracks the site id for the selected site in the help/contact form
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const selectedSiteId = ( state = null, action ) => {
	switch ( action.type ) {
		case HELP_CONTACT_FORM_SITE_SELECT:
			return action.siteId;
	}

	return state;
};

const combinedReducer = combineReducers( {
	ticket,
	selectedSiteId,
} );

export default withStorageKey( 'help', combinedReducer );
