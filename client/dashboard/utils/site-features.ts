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

// Returns activity log groups that should be hidden for the given site.
// Sites without self-serve backup access shouldn't see backup/scan events in the activity list.
export function getActivityLogHiddenGroups( site: Site ): string[] | undefined {
	const hasBackupsSelfServe = hasHostingFeature( site, DotcomFeatures.BACKUPS_SELF_SERVE );
	return hasBackupsSelfServe ? undefined : [ 'rewind', 'scan' ];
}
