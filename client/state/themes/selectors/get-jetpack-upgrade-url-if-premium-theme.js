import {
	PLAN_JETPACK_COMPLETE,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
} from '@automattic/calypso-products';
import { addQueryArgs } from '@wordpress/url';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import { isThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';

import 'calypso/state/themes/init';

/**
 * Returns the URL for purchasing a Jetpack Professional plan if the theme is a premium theme and site doesn't have access to them.
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme to check whether it's premium.¡
 * @param  {number}  siteId  Site ID for which to purchase the plan
 * @param  {Object}  options The options for the jetpack upgrade url
 * @returns {?string}         Plan purchase URL
 */
export function getJetpackUpgradeUrlIfPremiumTheme( state, themeId, siteId, options = {} ) {
	if (
		isJetpackSite( state, siteId ) &&
		! isSiteWpcomAtomic( state, siteId ) &&
		isThemePremium( state, themeId ) &&
		! siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED )
	) {
		return addQueryArgs( `/checkout/${ getSiteSlug( state, siteId ) }/${ PLAN_JETPACK_COMPLETE }`, {
			style_variation: options.styleVariationSlug,
		} );
	}
	return null;
}
