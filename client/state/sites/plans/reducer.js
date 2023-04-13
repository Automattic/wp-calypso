import { omit } from 'lodash';
import {
	SITE_PLANS_FETCH,
	SITE_PLANS_FETCH_COMPLETED,
	SITE_PLANS_FETCH_FAILED,
	SITE_PLANS_REMOVE,
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
 * @param {Object} state current state
 * @param {number} siteId identifier of the site
 * @param {Object} attributes list of attributes and their values
 * @returns {Object} the new state
 */
function updateSiteState( state, siteId, attributes ) {
	return Object.assign( {}, state, {
		[ siteId ]: Object.assign( {}, initialSiteState, state[ siteId ], attributes ),
	} );
}

export function plans( state = {}, action ) {
	switch ( action.type ) {
		case SITE_PLANS_FETCH:
			return updateSiteState( state, action.siteId, {
				error: null,
				isRequesting: true,
			} );

		case SITE_PLANS_FETCH_COMPLETED:
			return updateSiteState( state, action.siteId, {
				error: null,
				hasLoadedFromServer: true,
				isRequesting: false,
				data: action.plans,
			} );

		case SITE_PLANS_FETCH_FAILED:
			return updateSiteState( state, action.siteId, {
				error: action.error,
				isRequesting: false,
			} );

		case SITE_PLANS_REMOVE:
			return omit( state, action.siteId );
	}

	return state;
}
