import { DotcomFeatures } from '../data/constants';
import type { Site } from '../data/types';

export function hasPlanFeature( site: Site, feature: DotcomFeatures ) {
	if ( ! site.plan ) {
		return false;
	}

	return site.plan.features.active.includes( feature );
}
