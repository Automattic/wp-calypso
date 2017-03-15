/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { isValidStateWithSchema } from 'state/utils';
import {
	SITE_RECEIVE,
	SITES_RECEIVE,
	SITES_UPDATE,
	SITE_DELETE_RECEIVE,
	SITE_UPDATES_RECEIVE,
	SITE_UPDATES_REQUEST,
	SITE_UPDATES_REQUEST_SUCCESS,
	SITE_UPDATES_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

import { itemsSchema } from './schema';

export const items = ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_RECEIVE:
		case SITES_RECEIVE:
		case SITES_UPDATE:
			// Normalize incoming site(s) to array
			const sites = action.site ? [ action.site ] : action.sites;
			sites.forEach( ( site ) => {
				const updates = Object.assign(
					{},
					site.updates,
					{
						wp_version: get( site, 'options.software_version' ),
						jp_version: get( site, 'options.jetpack_version' )
					}
				);

				Object.assign(
					state,
					{
						[ site.ID ]: updates
					}
				);
			} );
			return state;
		case SITE_UPDATES_RECEIVE:
			const { siteId, updates } = action;
			return Object.assign(
				{},
				state,
				{
					[ siteId ]: updates
				}
			);
		case SITE_DELETE_RECEIVE:
			const site = action.site;
			return Object.assign(
				{},
				state,
				{
					[ site.ID ]: null
				}
			);
		case DESERIALIZE:
			if ( isValidStateWithSchema( state, itemsSchema ) ) {
				return state;
			}
			return {};
		case SERIALIZE:
			return state;
	}

	return state;
};

export const requesting = ( state = false, { type, siteId } ) => {
	switch ( type ) {
		case SITE_UPDATES_REQUEST:
		case SITE_UPDATES_REQUEST_SUCCESS:
		case SITE_UPDATES_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ siteId ]: ( type === SITE_UPDATES_REQUEST )
			} );
		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return {};
};

export const errors = ( state = false, { type, siteId, error } ) => {
	switch ( type ) {
		case SITE_UPDATES_REQUEST:
		case SITE_UPDATES_REQUEST_SUCCESS:
			return Object.assign( {}, state, {
				[ siteId ]: null
			} );

		case SITE_UPDATES_REQUEST_FAILURE:
			return Object.assign( {}, state, {
				[ siteId ]: error
			} );

		case SERIALIZE:
		case DESERIALIZE:
			return {};
	}

	return {};
};

export default combineReducers( {
	items,
	requesting,
	errors
} );
