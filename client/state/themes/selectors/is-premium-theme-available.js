import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { doesThemeBundleSoftwareSet } from 'calypso/state/themes/selectors/does-theme-bundle-software-set';
import { isExternallyManagedTheme } from 'calypso/state/themes/selectors/is-externally-managed-theme';
import { isSiteEligibleForBundledSoftware } from 'calypso/state/themes/selectors/is-site-eligible-for-bundled-software';
import { isThemePurchased } from 'calypso/state/themes/selectors/is-theme-purchased';

import 'calypso/state/themes/init';

/**
 * Whether a WPCOM premium theme can be activated on a site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID for which we check availability
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if the premium theme is available for the given site
 */
export function isPremiumThemeAvailable( state, themeId, siteId ) {
	// TODO: We'll need to update this condition once we have a way to check
	// whether the theme is subscribed to. This is related to the third-party premium
	// themes project.
	if ( isThemePurchased( state, themeId, siteId ) ) {
		return true;
	}

	/**
	 * If the theme is externally managed and is not purchased, it is not available.
	 */
	if ( isExternallyManagedTheme( state, themeId ) ) {
		return false;
	}

	const hasPremiumThemesFeature = siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES );

	/**
	 * Bundled Themes are themes that contain software, like woo-on-plans. In
	 * the UI, we strongly suggest that users purchase a business plan to get
	 * access to these themes. Without it, they won't have the ATOMIC feature
	 * and can't tranfer the site to Atomic and install the software.
	 *
	 * Note: The backend will let any site with the premium theme feature use
	 * bundled themes, including those sites missing the ATOMIC feature, but
	 * calypso considers ATOMIC+WOOP as a requirement to use bundled themes.
	 */
	if ( doesThemeBundleSoftwareSet( state, themeId ) ) {
		return hasPremiumThemesFeature && isSiteEligibleForBundledSoftware( state, siteId );
	}
	return hasPremiumThemesFeature;
}
