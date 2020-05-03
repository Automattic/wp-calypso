/**
 * External dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import 'state/themes/init';

/**
 * Returns a theme object by site ID, theme ID pair.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @param  {string}  themeId Theme ID
 * @returns {?object}         Theme object
 */
export const getTheme = createSelector(
	( state, siteId, themeId ) => {
		const manager = state.themes.queries[ siteId ];
		if ( ! manager ) {
			return null;
		}

		return manager.getItem( themeId );
	},
	( state ) => state.themes.queries
);
