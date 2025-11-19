import { DotcomFeatures } from '@automattic/api-core';
import type {
	DotcomFeatureSlug,
	HostingFeatureSlug,
	JetpackFeatureSlug,
	JetpackModuleSlug,
	Site,
} from '@automattic/api-core';

// Returns whether the plan supports a specific feature.
export function hasPlanFeature(
	site: { plan?: { features: { active: string[] } } },
	feature: `${ DotcomFeatureSlug | JetpackFeatureSlug }`
) {
	if ( ! site.plan ) {
		return false;
	}

	return site.plan.features.active.includes( feature );
}

export function isPlanFeatureAvailable( site: Site, feature: HostingFeatureSlug ) {
	if ( ! site.plan ) {
		return false;
	}

	return !! site.plan.features.available?.[ feature ];
}

// Returns whether the plan supports a specific "hosting feature",
// which is a feature that requires Atomic or self-hosted infrastructure.
export function hasHostingFeature( site: Site, feature: HostingFeatureSlug ) {
	if ( hasPlanFeature( site, DotcomFeatures.ATOMIC ) ) {
		const isWoAOrFlexSite = site.is_wpcom_atomic || site.is_wpcom_flex;
		if ( site.plan?.expired || ! isWoAOrFlexSite ) {
			return false;
		}
	}
	return hasPlanFeature( site, feature );
}

export function hasJetpackModule( site: Site, module: `${ JetpackModuleSlug }` ) {
	return site.jetpack && site.jetpack_modules?.includes( module );
}
