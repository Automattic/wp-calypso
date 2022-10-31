import { getSiteSlug } from 'calypso/state/sites/selectors';
import { isExternallyManagedTheme } from 'calypso/state/themes/selectors/is-externally-managed-theme';
import { isThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';

import 'calypso/state/themes/init';

type BillingCycle = 'monthly' | 'yearly';

/**
 * Returns the URL for subscribing to the given theme for the given site.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {number}  siteId  Site ID for which to buy the theme
 * @returns {?string}         Theme purchase URL
 */
export function getThemeSubscriptionUrl(
	state = {},
	themeId: string,
	siteId: number,
	cycle: BillingCycle = 'monthly'
): null | string {
	if ( ! isExternallyManagedTheme( state, themeId ) || ! isThemePremium( state, themeId as any ) ) {
		return null;
	}
	return `/checkout/${ getSiteSlug( state, siteId ) }/theme-${ cycle }:${ themeId }`;
}
