import {
	DotcomFeatures,
	HostingFeatures,
	JetpackFeatures,
	JetpackModules,
} from '../data/constants';
import type { Site } from '../data/types';

// Returns whether the plan supports a specific feature.
export function hasPlanFeature( site: Site, feature: `${ DotcomFeatures | JetpackFeatures }` ) {
	if ( ! site.plan ) {
		return false;
	}

	return site.plan.features.active.includes( feature );
}

// Returns whether the plan supports a specific "hosting feature",
// which is a feature that requires Atomic or self-hosted infrastructure.
export function hasHostingFeature( site: Site, feature: HostingFeatures ) {
	if ( hasPlanFeature( site, DotcomFeatures.ATOMIC ) ) {
		if ( site.plan?.expired || ! site.is_wpcom_atomic ) {
			return false;
		}
	}
	return hasPlanFeature( site, feature );
}

export function hasJetpackModule( site: Site, module: `${ JetpackModules }` ) {
	return site.jetpack && site.jetpack_modules?.includes( module );
}
