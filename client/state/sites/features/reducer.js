import {
	JETPACK_SITES_FEATURES_FETCH,
	JETPACK_SITES_FEATURES_FETCH_FAILURE,
	JETPACK_SITES_FEATURES_FETCH_SUCCESS,
	JETPACK_SITES_FEATURES_RECEIVE,
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

/**
 * Given an object of features keyed by siteId, updates all features at once.
 *
 * @param {object} state The current features state
 * @param {object} features An object containing feature arrays keyed by siteId
 * @returns The new state
 */
function updateBulkFeatures( state, features ) {
	const newState = {};
	for ( const siteId in features ) {
		newState[ siteId ] = {
			error: null,
			hasLoadedFromServer: true,
			isRequesting: false,
			data: features,
		};
	}
	return { ...state, ...newState };
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
		case JETPACK_SITES_FEATURES_FETCH:
			return { ...state, isRequestingJetpackSitesFeatures: true };
		case JETPACK_SITES_FEATURES_FETCH_SUCCESS:
		case JETPACK_SITES_FEATURES_FETCH_FAILURE:
			return { ...state, isRequestingJetpackSitesFeatures: false };
		case JETPACK_SITES_FEATURES_RECEIVE:
			return updateBulkFeatures( state, features );
	}

	return state;
}
