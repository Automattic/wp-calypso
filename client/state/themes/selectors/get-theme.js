import { createSelector } from '@automattic/state-utils';

import 'calypso/state/themes/init';

/**
 * Returns a theme object by site ID, theme ID pair.
 *
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @param  {string}  themeId Theme ID
 * @returns {?Object}         Theme object
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
