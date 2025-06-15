import { DotcomFeatures } from '../data/constants';
import type { Site } from '../data/types';

export function hasPlanFeature( site: Site, feature: DotcomFeatures ) {
	if ( ! site.plan ) {
		return false;
	}

	return site.plan.features.active.includes( feature );
}

export interface HostingFeaturePredicateOptions {
	assumeSiteIsAtomic?: boolean;
}

export function hasHostingFeature(
	site: Site,
	feature: DotcomFeatures,
	opts: HostingFeaturePredicateOptions = {}
) {
	const isAtomic =
		site.is_wpcom_atomic ||
		( !! opts.assumeSiteIsAtomic && hasPlanFeature( site, DotcomFeatures.ATOMIC ) );

	return isAtomic && ! site.plan?.expired && hasPlanFeature( site, feature );
}
