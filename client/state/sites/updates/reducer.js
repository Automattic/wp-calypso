/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import { createReducer } from 'state/utils';

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

export const requesting = createReducer( {}, {
	[ SITE_UPDATES_REQUEST ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
	[ SITE_UPDATES_REQUEST_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ SITE_UPDATES_REQUEST_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
} );

export const errors = createReducer( {}, {
	[ SITE_UPDATES_REQUEST ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ SITE_UPDATES_REQUEST_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	[ SITE_UPDATES_REQUEST_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
} );

export default combineReducers( {
	items,
	requesting,
	errors
} );
