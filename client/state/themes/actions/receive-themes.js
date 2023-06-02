import { filter } from 'lodash';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { THEMES_REQUEST_SUCCESS } from 'calypso/state/themes/action-types';
import { isThemeMatchingQuery } from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

/**
 * Returns an action object to be used in signalling that theme objects from
 * a query have been received.
 *
 * @param {Array}  themes Themes received
 * @param {number} siteId ID of site for which themes have been received
 * @param {?Object} query Theme query used in the API request
 * @param {?number} foundCount Number of themes returned by the query
 * @returns {Object} Action object
 */
export function receiveThemes( themes, siteId, query, foundCount ) {
	return ( dispatch, getState ) => {
		let filteredThemes = themes;
		let found = foundCount;

		if ( isJetpackSite( getState(), siteId ) ) {
			/*
			 * We need to do client-side filtering for Jetpack sites
			 * because Jetpack theme API does not support search queries
			 */
			filteredThemes = filter( themes, ( theme ) => isThemeMatchingQuery( query, theme ) );

			// Jetpack API returns all themes in one response (no paging)
			found = filteredThemes.length;
		}

		dispatch( {
			type: THEMES_REQUEST_SUCCESS,
			themes: filteredThemes,
			siteId,
			query,
			found,
		} );
	};
}
