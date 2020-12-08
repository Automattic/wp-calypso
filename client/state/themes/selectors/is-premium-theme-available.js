/**
 * Internal dependencies
 */
import { FEATURE_UNLIMITED_PREMIUM_THEMES } from 'calypso/lib/plans/constants';
import { hasFeature } from 'calypso/state/sites/plans/selectors';
import { isThemePurchased } from 'calypso/state/themes/selectors/is-theme-purchased';

import 'calypso/state/themes/init';

/**
 * Whether a WPCOM premium theme can be activated on a site.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID for which we check availability
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if the premium theme is available for the given site
 */
export function isPremiumThemeAvailable( state, themeId, siteId ) {
	return (
		isThemePurchased( state, themeId, siteId ) ||
		hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES )
	);
}
