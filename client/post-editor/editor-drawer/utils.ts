/**
 * Internal dependencies
 */
import { isEnterprise } from 'lib/products-values';
import { FEATURE_ADVANCED_SEO } from 'lib/plans/constants';
import { hasSiteFeature } from 'lib/site/utils';

/**
 * Type dependencies
 */
import type { Plan } from 'state/plans/types';

type Site = {
	plan: Plan;
};

export function hasSiteSeoFeature( site: Site ): boolean | undefined {
	return (
		hasSiteFeature( site, FEATURE_ADVANCED_SEO ) ||
		( ( site?.plan && isEnterprise( site.plan ) ) ?? undefined )
	);
}
