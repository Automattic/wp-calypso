/** @format */

/**
 * External dependencies
 */

import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';
import { SITE_RECEIVE, SITES_RECEIVE, SITE_PLUGIN_UPDATED } from 'state/action-types';
import { itemsSchema } from './schema';

const receiveUpdatesForSites = ( state, sites ) => {
	const updatedSites = sites.filter( site => site.updates );
	return isEmpty( updatedSites )
		? state
		: sites.reduce(
				( newState, site ) => {
					newState[ site.ID ] = site.updates;
					return newState;
				},
				{ ...state }
			);
};

export const items = createReducer(
	{},
	{
		[ SITE_RECEIVE ]: ( state, { site } ) => receiveUpdatesForSites( state, [ site ] ),
		[ SITES_RECEIVE ]: ( state, { sites } ) => receiveUpdatesForSites( state, sites ),
		[ SITE_PLUGIN_UPDATED ]: ( state, { siteId } ) => {
			const siteUpdates = state[ siteId ];
			if ( ! siteUpdates ) {
				return state;
			}

			return {
				...state,
				[ siteId ]: {
					...siteUpdates,
					plugins: siteUpdates.plugins - 1,
					total: siteUpdates.total - 1,
				},
			};
		},
	},
	itemsSchema
);

export default combineReducers( { items } );
