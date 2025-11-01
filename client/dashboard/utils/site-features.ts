import {
	DotcomFeatures,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
} from '@automattic/api-core';
import { isJetpackPlanSlug, isJetpackBackupSlug } from './purchase';
import type {
	DotcomFeatureSlug,
	HostingFeatureSlug,
	JetpackFeatureSlug,
	JetpackModuleSlug,
	CancellationFeature,
	Site,
} from '@automattic/api-core';

// Returns whether the plan supports a specific feature.
export function hasPlanFeature(
	site: Site,
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

/**
 * Determine if a plan has at least one of several features.
 */
function planHasAtLeastOneFeature(
	productFeatures: CancellationFeature[],
	plan: string,
	features: string[]
): boolean {
	const productFeatureIds = productFeatures.map( ( feature ) => feature.feature_id );
	return features.some( ( feature ) => productFeatureIds.includes( feature ) );
}

export const productHasBackups = (
	productFeatures: CancellationFeature[],
	productSlug: string
): boolean => {
	const BACKUP_FEATURES = [
		PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		PRODUCT_JETPACK_BACKUP_DAILY,
		PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
		PRODUCT_JETPACK_BACKUP_REALTIME,
		PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
		PRODUCT_JETPACK_BACKUP_T1_YEARLY,
		PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
		PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	];

	return (
		// standalone backup product
		isJetpackBackupSlug( productSlug ) ||
		// check plans for Jetpack backup features
		( isJetpackPlanSlug( productSlug ) &&
			planHasAtLeastOneFeature( productFeatures, productSlug, BACKUP_FEATURES ) )
	);
};
