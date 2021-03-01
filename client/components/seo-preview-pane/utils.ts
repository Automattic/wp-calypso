/**
 * Internal dependencies
 */
import { isEnterprise } from 'calypso/lib/products-values';
import { FEATURE_SEO_PREVIEW_TOOLS } from 'calypso/lib/plans/constants';
import { hasSiteFeature } from 'calypso/lib/site/utils';

/**
 * Type dependencies
 */
import type { Plan } from 'calypso/state/plans/types';

type Site = {
	plan: Plan;
};

export function hasSiteSeoFeature( site: Site ): boolean | undefined {
	return (
		hasSiteFeature( site, FEATURE_SEO_PREVIEW_TOOLS ) ||
		( ( site?.plan && isEnterprise( site.plan ) ) ?? undefined )
	);
}
