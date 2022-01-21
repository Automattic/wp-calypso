import { PLAN_JETPACK_COMPLETE, FEATURE_PREMIUM_THEMES } from '@automattic/calypso-products';
import { hasFeature } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { isThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';

import 'calypso/state/themes/init';

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
		! hasFeature( state, siteId, FEATURE_PREMIUM_THEMES )
	) {
		return `/checkout/${ getSiteSlug( state, siteId ) }/${ PLAN_JETPACK_COMPLETE }`;
	}
	return null;
}
