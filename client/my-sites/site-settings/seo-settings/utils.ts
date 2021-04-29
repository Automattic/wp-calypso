/**
 * Internal dependencies
 */
import { isEnterprise } from '@automattic/calypso-products';
import { FEATURE_ADVANCED_SEO } from '@automattic/calypso-products';
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
		hasSiteFeature( site, FEATURE_ADVANCED_SEO ) ||
		( ( site?.plan && isEnterprise( site.plan ) ) ?? undefined )
	);
}
