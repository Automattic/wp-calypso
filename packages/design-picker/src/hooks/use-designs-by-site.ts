import { isEnabled } from '@automattic/calypso-config';
import { planHasFeature, FEATURE_PREMIUM_THEMES } from '@automattic/calypso-products';
import { SiteDetails } from '@automattic/data-stores/src/site';
import { useMemo } from 'react';
import { useThemeDesignsQuery } from './use-theme-designs-query';

/**
 * Fetches the designs based on the site information
 *
 * @param site the site
 */
export function useDesignsBySite( site: SiteDetails | null ) {
	const sitePlanSlug = site?.plan?.product_slug;

	const isPremiumThemeAvailable = Boolean(
		useMemo(
			() => sitePlanSlug && planHasFeature( sitePlanSlug, FEATURE_PREMIUM_THEMES ),
			[ sitePlanSlug ]
		)
	);

	const tier =
		isPremiumThemeAvailable || isEnabled( 'signup/design-picker-premium-themes-checkout' )
			? 'all'
			: 'free';

	const FSEEligible = site?.is_fse_eligible;

	const themeFilters = FSEEligible
		? 'auto-loading-homepage,full-site-editing'
		: 'auto-loading-homepage';

	return useThemeDesignsQuery(
		{ filter: themeFilters, tier },
		// Wait until FSS eligibility is loaded to load themes
		{ enabled: !! site }
	);
}
