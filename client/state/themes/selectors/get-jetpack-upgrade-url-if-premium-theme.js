/**
 * Internal dependencies
 */
import { FEATURE_UNLIMITED_PREMIUM_THEMES } from 'lib/plans/constants';
import { getSiteSlug, isJetpackSite } from 'state/sites/selectors';
import { hasFeature } from 'state/sites/plans/selectors';
import { isThemePremium } from 'state/themes/selectors/is-theme-premium';

import 'state/themes/init';

/**
 * Returns the URL for purchasing a Jetpack Professional plan if the theme is a premium theme and site doesn't have access to them.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme to check whether it's premium.¡
 * @param  {number}  siteId  Site ID for which to purchase the plan
 * @returns {?string}         Plan purchase URL
 */
export function getJetpackUpgradeUrlIfPremiumTheme( state, themeId, siteId ) {
	if (
		isJetpackSite( state, siteId ) &&
		isThemePremium( state, themeId ) &&
		! hasFeature( state, siteId, FEATURE_UNLIMITED_PREMIUM_THEMES )
	) {
		return `/checkout/${ getSiteSlug( state, siteId ) }/professional`;
	}
	return null;
}
