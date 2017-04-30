/**
 * External dependencies
 */
import isEmpty from 'lodash/isEmpty';
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	HELP_SELECTED_SITE,
	SITES_RECEIVE,
} from 'state/action-types';
import courses from './courses/reducer';
import directly from './directly/reducer';
import ticket from './ticket/reducer';
import { createReducer } from 'state/utils';

const selectFirstSite = ( sites ) => {
	if ( ! isEmpty( sites ) ) {
		return sites[ 0 ].ID;
	}
	return null;
};

/**
 * Tracks the site id for the selected site in the help/contact form
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const selectedSiteId = createReducer( null, {
	[ HELP_SELECTED_SITE ]: ( state, action ) => action.siteId,
	[ SITES_RECEIVE ]: ( state, action ) => selectFirstSite( action.sites ),
} );

export default combineReducers( {
	courses,
	directly,
	ticket,
	selectedSiteId,
} );
