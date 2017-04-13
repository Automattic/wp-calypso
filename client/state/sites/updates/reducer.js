/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { isEmpty, stubFalse, stubTrue } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer, keyedReducer } from 'state/utils';

import {
	SITE_RECEIVE,
	SITES_RECEIVE,
	SITES_UPDATE,
	SITE_UPDATES_RECEIVE,
	SITE_UPDATES_REQUEST,
	SITE_UPDATES_REQUEST_SUCCESS,
	SITE_UPDATES_REQUEST_FAILURE,
} from 'state/action-types';

import { itemsSchema } from './schema';

const receiveUpdatesForSites = ( state, sites ) => {
	const updatedSites = sites.filter( ( site ) => site.updates );
	return isEmpty( updatedSites )
		? state
		: sites.reduce( ( newState, site ) => {
			newState[ site.ID ] = site.updates;
			return newState;
		}, { ...state } );
};

export const items = createReducer(
	{},
	{
		[ SITE_UPDATES_RECEIVE ]: ( state, { siteId, updates } ) => Object.assign( {}, state, { [ siteId ]: updates } ),
		[ SITE_RECEIVE ]: ( state, { site } ) => receiveUpdatesForSites( state, [ site ] ),
		[ SITES_RECEIVE ]: ( state, { sites } ) => receiveUpdatesForSites( state, sites ),
		[ SITES_UPDATE ]: ( state, { sites } ) => receiveUpdatesForSites( state, sites ),
	},
	itemsSchema
);

export const requesting = keyedReducer( 'siteId', createReducer( undefined, {
	[ SITE_UPDATES_REQUEST ]: stubTrue,
	[ SITE_UPDATES_REQUEST_SUCCESS ]: stubFalse,
	[ SITE_UPDATES_REQUEST_FAILURE ]: stubFalse,
} ) );

export const errors = keyedReducer( 'siteId', createReducer( undefined, {
	[ SITE_UPDATES_REQUEST ]: stubFalse,
	[ SITE_UPDATES_REQUEST_SUCCESS ]: stubFalse,
	[ SITE_UPDATES_REQUEST_FAILURE ]: stubTrue,
} ) );

export default combineReducers( {
	items,
	requesting,
	errors
} );
