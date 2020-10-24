/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import { isJetpackSite } from 'calypso/state/sites/selectors';

import 'calypso/state/wordads/init';

/**
 * Returns the WordAds settings on a certain site.
 * Returns null if the site is unknown, or settings have not been fetched yet.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  The ID of the site we're querying
 * @returns {?object}        WordAds settings
 */
export const getWordadsSettings = createSelector(
	( state, siteId ) => {
		const settings = state.wordads.settings.items[ siteId ];
		if ( ! settings ) {
			return null;
		}

		const siteIsJetpack = isJetpackSite( state, siteId );
		const normalizedSettings = {
			us_checked: 'yes' === settings.us_resident,
			// JP doesn't matter, force yes to make things easier
			show_to_logged_in: siteIsJetpack ? 'yes' : settings.show_to_logged_in,
		};

		return {
			...settings,
			...normalizedSettings,
		};
	},
	( state, siteId ) => [ state.wordads.settings.items[ siteId ] ]
);

export default getWordadsSettings;
