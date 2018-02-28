/** @format */

/**
 * External dependencies
 */

import { isEmpty, merge, stubFalse, stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, createReducer, keyedReducer } from 'state/utils';
import {
	SITE_RECEIVE,
	SITES_RECEIVE,
	SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS,
	SITE_WORDPRESS_UPDATE_REQUEST_FAILURE,
	SITE_PLUGIN_UPDATED,
} from 'state/action-types';

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
		[ SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS ]: ( state, { siteId } ) => {
			if ( ! state[ siteId ] ) {
				return state;
			}

			return merge( {}, state, {
				[ siteId ]: {
					wordpress: state[ siteId ].wordpress - 1,
					total: state[ siteId ].total - 1,
				},
			} );
		},
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

export const wordpressUpdateStatus = keyedReducer(
	'siteId',
	createReducer( undefined, {
		[ SITE_WORDPRESS_UPDATE_REQUEST_SUCCESS ]: stubTrue,
		[ SITE_WORDPRESS_UPDATE_REQUEST_FAILURE ]: stubFalse,
	} )
);

export default combineReducers( {
	items,
	wordpressUpdateStatus,
} );
