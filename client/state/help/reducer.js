import { withStorageKey } from '@automattic/state-utils';
import { HELP_CONTACT_FORM_SITE_SELECT } from 'calypso/state/action-types';
import { combineReducers } from 'calypso/state/utils';
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

const combinedReducer = combineReducers( {
	directly,
	ticket,
	selectedSiteId,
} );

export default withStorageKey( 'help', combinedReducer );
