/**
 * External dependencies
 */

import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import {
	SITE_PRODUCTS_FETCH,
	SITE_PRODUCTS_FETCH_COMPLETED,
	SITE_PRODUCTS_FETCH_FAILED,
	SITE_PRODUCTS_REMOVE,
} from 'calypso/state/action-types';

export const initialSiteState = {
	data: null,
	error: null,
	hasLoadedFromServer: false,
	isRequesting: false,
};

/**
 * Returns a new state with the given attributes updated for the specified site.
 *
 * @param {object} state current state
 * @param {number} siteId identifier of the site
 * @param {object} attributes list of attributes and their values
 * @returns {object} the new state
 */
function updateSiteState( state, siteId, attributes ) {
	return Object.assign( {}, state, {
		[ siteId ]: Object.assign( {}, initialSiteState, state[ siteId ], attributes ),
	} );
}

export function products( state = {}, action ) {
	switch ( action.type ) {
		case SITE_PRODUCTS_FETCH:
			return updateSiteState( state, action.siteId, {
				error: null,
				isRequesting: true,
			} );

		case SITE_PRODUCTS_FETCH_COMPLETED:
			return updateSiteState( state, action.siteId, {
				error: null,
				hasLoadedFromServer: true,
				isRequesting: false,
				data: action.products,
			} );

		case SITE_PRODUCTS_FETCH_FAILED:
			return updateSiteState( state, action.siteId, {
				error: action.error,
				isRequesting: false,
			} );

		case SITE_PRODUCTS_REMOVE:
			return omit( state, action.siteId );
	}

	return state;
}
