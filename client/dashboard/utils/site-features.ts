import { DotcomFeatures } from '../data/constants';
import type { Site } from '../data/types';

export function hasPlanFeature( site: Site, feature: DotcomFeatures ) {
	if ( ! site.plan ) {
		return false;
	}

	return site.plan.features.active.includes( feature );
}

export function hasHostingFeatures( site: Site ) {
	return site.is_wpcom_atomic && ! site.plan?.expired;
}

export function hasAdvancedHostingFeatures( site: Site ) {
	return hasHostingFeatures( site ) && hasPlanFeature( site, DotcomFeatures.SFTP );
}
