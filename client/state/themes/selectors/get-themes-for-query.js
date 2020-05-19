/**
 * External dependencies
 */
import { includes, uniq } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import { getSerializedThemesQuery } from 'state/themes/utils';

import 'state/themes/init';

/**
 * Returns an array of normalized themes for the themes query, or null if no
 * themes have been received.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {object}  query  Theme query object
 * @returns {?Array}         Themes for the theme query
 */
export const getThemesForQuery = createSelector(
	( state, siteId, query ) => {
		const manager = state.themes.queries[ siteId ];
		if ( ! manager ) {
			return null;
		}

		const themes = manager.getItems( query );
		if ( ! themes ) {
			return null;
		}

		// ThemeQueryManager will return an array including undefined entries if
		// it knows that a page of results exists for the query (via a previous
		// request's `found` value) but the items haven't been received. While
		// we could impose this on the developer to accommodate, instead we
		// simply return null when any `undefined` entries exist in the set.
		if ( includes( themes, undefined ) ) {
			return null;
		}

		// FIXME: The themes endpoint weirdly sometimes returns duplicates (spread
		// over different pages) which we need to remove manually here for now.
		return uniq( themes );
	},
	( state ) => state.themes.queries,
	( state, siteId, query ) => getSerializedThemesQuery( query, siteId )
);
