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

// This type represents things that React can render, but which also exist. (E.g.
// not nullable, not undefined, etc.)
type ExistingReactNode = React.ReactElement | string | number;

// Translate hooks, like component interpolation or highlighting untranslated strings,
// force us to declare the return type as a generic React node, not as just string.
type TranslateResult = ExistingReactNode;

export type FeatureObject = {
	getSlug: () => string;
	getTitle: ( params?: { domainName?: string } ) => TranslateResult;
	getDescription?: ( params?: { domainName?: string } ) => TranslateResult;
	getFeatureGroup?: () => string;
	getStoreSlug?: () => string;
	isPlan?: boolean;
};

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
		if ( site.plan?.expired || ! site.is_wpcom_atomic ) {
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

//used
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
