import {
	SITE_FEATURES_FETCH,
	SITE_FEATURES_FETCH_COMPLETED,
	SITE_FEATURES_FETCH_FAILED,
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

export function featuresReducer( state = {}, { type, siteId, features, error } ) {
	switch ( type ) {
		case SITE_FEATURES_FETCH:
			return updateSiteState( state, siteId, {
				error: null,
				isRequesting: true,
			} );

		case SITE_FEATURES_FETCH_COMPLETED:
			return updateSiteState( state, siteId, {
				error: null,
				hasLoadedFromServer: true,
				isRequesting: false,
				data: features,
			} );

		case SITE_FEATURES_FETCH_FAILED:
			return updateSiteState( state, siteId, {
				error: error,
				isRequesting: false,
			} );
	}

	return state;
}
