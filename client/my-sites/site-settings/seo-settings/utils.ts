/**
 * Internal dependencies
 */
import { isEnterprise, FEATURE_ADVANCED_SEO } from '@automattic/calypso-products';
import { hasSiteFeature, isEligibleForSEOFeatures } from 'calypso/lib/site/utils';

/**
 * Type dependencies
 */
import type { Plan } from 'calypso/state/plans/types';

type Site = {
	plan: Plan;
};

export function hasSiteSeoFeature(
	site: Site,
	state: string,
	siteId: string
): boolean | undefined {
	if ( ! isEligibleForSEOFeatures( site, state, siteId ) ) {
		return false;
	}

	return (
		hasSiteFeature( site, FEATURE_ADVANCED_SEO ) ||
		( ( site?.plan && isEnterprise( site.plan ) ) ?? undefined )
	);
}
