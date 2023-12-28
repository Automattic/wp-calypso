import { createSelector } from '@automattic/state-utils';
import 'calypso/state/themes/init';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Returns a theme object by site ID, theme ID pair.
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @param  {string}  themeId Theme ID
 * @returns {?Object}         Theme object
 */
export const getTheme = createSelector(
	( state, siteId, themeId ) => {
		let manager = state.themes.queries[ siteId ];

		if ( ! manager && siteId === 'wpcom' ) {
			const fallbackSiteId = getSelectedSiteId( state );
			manager = state.themes.queries[ fallbackSiteId ];
		}

		if ( ! manager ) {
			return null;
		}

		return manager.getItem( themeId );
	},
	( state ) => state.themes.queries
);
