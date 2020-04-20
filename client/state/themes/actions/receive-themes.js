/**
 * External dependencies
 */
import { filter } from 'lodash';

/**
 * Internal dependencies
 */
import { THEMES_REQUEST_SUCCESS } from 'state/themes/action-types';
import { isJetpackSite } from 'state/sites/selectors';
import { shouldFilterWpcomThemes } from 'state/themes/selectors';
import { isThemeFromWpcom, isThemeMatchingQuery } from 'state/themes/utils';

import 'state/themes/init';

/**
 * Returns an action object to be used in signalling that theme objects from
 * a query have been received.
 *
 * @param {Array}  themes Themes received
 * @param {number} siteId ID of site for which themes have been received
 * @param {?object} query Theme query used in the API request
 * @param {?number} foundCount Number of themes returned by the query
 * @returns {object} Action object
 */
export function receiveThemes( themes, siteId, query, foundCount ) {
	return ( dispatch, getState ) => {
		let filteredThemes = themes;
		let found = foundCount;

		if ( isJetpackSite( getState(), siteId ) ) {
			/*
			 * We need to do client-side filtering for Jetpack sites because:
			 * 1) Jetpack theme API does not support search queries
			 * 2) We need to filter out all wpcom themes to show an 'Uploaded' list
			 */
			const filterWpcom = shouldFilterWpcomThemes( getState(), siteId );
			filteredThemes = filter(
				themes,
				( theme ) =>
					isThemeMatchingQuery( query, theme ) && ! ( filterWpcom && isThemeFromWpcom( theme ) )
			);
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
