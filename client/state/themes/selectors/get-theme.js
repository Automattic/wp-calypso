import { createSelector } from '@automattic/state-utils';
import 'calypso/state/themes/init';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Returns a theme object by site ID, theme ID pair.
 * @param  {Object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @param  {string}  themeId Theme ID
 * @returns {?Object}         Theme object
 */
export const getTheme = createSelector(
	( state, sourceAndSiteId, themeId ) => {
		let siteId = sourceAndSiteId;

		if ( 'wpcom' === sourceAndSiteId && isUserLoggedIn( state ) ) {
			siteId = getSelectedSiteId( state );
		} else if ( 'wpcom' === sourceAndSiteId && ! isUserLoggedIn( state ) ) {
			siteId = 'wpcom';
		}

		let manager = state.themes.queries[ siteId ];

		if ( ! manager && sourceAndSiteId === 'wpcom' ) {
			manager = state.themes.queries.wpcom;
		}

		if ( ! manager ) {
			return null;
		}

		return manager.getItem( themeId );
	},
	( state ) => state.themes.queries
);

export const isThemeInstalledOnSite = createSelector(
	( state, sourceAndSiteId, themeId ) => {
		const query = '[["request_type","my-themes"]]';
		let siteId = sourceAndSiteId;

		if ( 'wpcom' === sourceAndSiteId && isUserLoggedIn( state ) ) {
			siteId = getSelectedSiteId( state );
		} else if ( 'wpcom' === sourceAndSiteId && ! isUserLoggedIn( state ) ) {
			siteId = 'wpcom';
		}

		let manager = state.themes.queries[ siteId ];

		if ( ! manager && sourceAndSiteId === 'wpcom' ) {
			manager = state.themes.queries.wpcom;
		}

		if ( ! manager ) {
			return false;
		}

		return manager.getItems( query ).has( themeId );
	},
	( state ) => state.themes.queries
);
