import {
	FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
	FEATURE_JETPACK_ANTI_SPAM,
	FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
	FEATURE_JETPACK_BACKUP_DAILY,
	FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
	FEATURE_JETPACK_BACKUP_T1_MONTHLY,
	FEATURE_JETPACK_BACKUP_T2_YEARLY,
	FEATURE_JETPACK_BACKUP_T2_MONTHLY,
	FEATURE_JETPACK_BACKUP_T1_YEARLY,
	FEATURE_JETPACK_SCAN_DAILY,
	FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
	FEATURE_JETPACK_SEARCH,
	FEATURE_JETPACK_SEARCH_MONTHLY,
	FEATURE_JETPACK_VIDEOPRESS,
	FEATURE_JETPACK_VIDEOPRESS_MONTHLY,
	isJetpackAntiSpamSlug,
	isJetpackBackupSlug,
	isJetpackPlanSlug,
	isJetpackScanSlug,
	isJetpackSearchSlug,
	isJetpackBoostSlug,
	planHasAtLeastOneFeature,
	PRODUCT_JETPACK_VIDEOPRESS,
	PRODUCT_JETPACK_VIDEOPRESS_MONTHLY,
	FEATURE_CLOUD_CRITICAL_CSS,
	isJetpackStatsSlug,
	isJetpackStatsPaidProductSlug,
	FEATURE_STATS_PAID,
	FEATURE_STATS_FREE,
	FEATURE_TYPE_JETPACK_ANTI_SPAM,
	FEATURE_TYPE_JETPACK_ACTIVITY_LOG,
	FEATURE_TYPE_JETPACK_BACKUP,
	FEATURE_TYPE_JETPACK_BOOST,
	FEATURE_TYPE_JETPACK_SCAN,
	FEATURE_TYPE_JETPACK_SEARCH,
	FEATURE_TYPE_JETPACK_STATS,
	FEATURE_TYPE_JETPACK_VIDEOPRESS,
} from '@automattic/calypso-products';

export const productHasActivityLog = ( productSlug: string ): boolean => {
	// Any site with Jetpack free will have the activity log
	// Highlighting the log here just for backup products or paid plans, since there are more benefits in these cases (more history, finding previous backups)
	return isJetpackPlanSlug( productSlug ) || isJetpackBackupSlug( productSlug );
};

export const productHasAntiSpam = ( productSlug: string ): boolean => {
	const ANTISPAM_FEATURES = [ FEATURE_JETPACK_ANTI_SPAM, FEATURE_JETPACK_ANTI_SPAM_MONTHLY ];

	// check that this product is standalone anti-spam or one of the plans that contains it
	return (
		// standalone anti-spam product
		isJetpackAntiSpamSlug( productSlug ) ||
		// check plans for anti-spam features
		( isJetpackPlanSlug( productSlug ) &&
			planHasAtLeastOneFeature( productSlug, ANTISPAM_FEATURES ) )
	);
};

export const productHasBackups = ( productSlug: string ): boolean => {
	const BACKUP_FEATURES = [
		FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
		FEATURE_JETPACK_BACKUP_DAILY,
		FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
		FEATURE_JETPACK_BACKUP_REALTIME,
		FEATURE_JETPACK_BACKUP_T1_MONTHLY,
		FEATURE_JETPACK_BACKUP_T1_YEARLY,
		FEATURE_JETPACK_BACKUP_T2_MONTHLY,
		FEATURE_JETPACK_BACKUP_T2_YEARLY,
	];

	return (
		// standalone backup product
		isJetpackBackupSlug( productSlug ) ||
		// check plans for Jetpack backup features
		( isJetpackPlanSlug( productSlug ) && planHasAtLeastOneFeature( productSlug, BACKUP_FEATURES ) )
	);
};

/**
 * Checks if the product has Boost features
 */
export const productHasBoost = ( productSlug: string ): boolean => {
	return (
		// If the product is a standalone Boost product
		isJetpackBoostSlug( productSlug ) ||
		// If Boost is included in the plan
		( isJetpackPlanSlug( productSlug ) &&
			planHasAtLeastOneFeature( productSlug, [ FEATURE_CLOUD_CRITICAL_CSS ] ) )
	);
};

export const productHasScan = ( productSlug: string ): boolean => {
	const SCAN_FEATURES = [ FEATURE_JETPACK_SCAN_DAILY, FEATURE_JETPACK_SCAN_DAILY_MONTHLY ];

	return (
		// standalone scan product
		isJetpackScanSlug( productSlug ) ||
		// check plans for Jetpack scan features
		( isJetpackPlanSlug( productSlug ) && planHasAtLeastOneFeature( productSlug, SCAN_FEATURES ) )
	);
};

export const productHasSearch = ( productSlug: string ): boolean => {
	const SEARCH_FEATURES = [
		FEATURE_JETPACK_SEARCH,
		FEATURE_JETPACK_SEARCH_MONTHLY,

		// This is a bit obscure -- checks specifically for Jetpack Business (Professional).
		// Is it an error that the plan spec in plans-list.js does not contain search features?
		FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
	];

	return (
		// standalone search product
		isJetpackSearchSlug( productSlug ) ||
		// check plans for Jetpack search features
		( isJetpackPlanSlug( productSlug ) && planHasAtLeastOneFeature( productSlug, SEARCH_FEATURES ) )
	);
};

export const productHasStats = ( productSlug: string, onlyPaid = false ): boolean => {
	// Check for standalone stats product
	if ( isJetpackStatsSlug( productSlug ) ) {
		return ! onlyPaid || isJetpackStatsPaidProductSlug( productSlug );
	}
	// Check for paid stats features in plans
	if ( isJetpackPlanSlug( productSlug ) && onlyPaid ) {
		return planHasAtLeastOneFeature( productSlug, [ FEATURE_STATS_PAID ] );
	}
	// Check for all stats features in plans
	if ( isJetpackPlanSlug( productSlug ) && ! onlyPaid ) {
		return planHasAtLeastOneFeature( productSlug, [ FEATURE_STATS_PAID, FEATURE_STATS_FREE ] );
	}
	return false;
};

/**
 * Checks if the product IS Jetpack VideoPress, or if it contains Jetpack VideoPress as a feature.
 * @param productSlug The product slug
 * @returns whether or not the product has VideoPress.
 */
export const productHasVideoPress = ( productSlug: string ): boolean => {
	return (
		planHasAtLeastOneFeature( productSlug, [
			FEATURE_JETPACK_VIDEOPRESS,
			FEATURE_JETPACK_VIDEOPRESS_MONTHLY,
		] ) ||
		[ PRODUCT_JETPACK_VIDEOPRESS, PRODUCT_JETPACK_VIDEOPRESS_MONTHLY ].includes( productSlug )
	);
};

/**
 * Checks if a product has a feature type.
 * @param {string} productSlug The product slug.
 * @param {string} featureType The feature type.
 * @returns {boolean} Whether or not a product has a feature type.
 */
export const productHasFeatureType = ( productSlug: string, featureType: string ): boolean => {
	switch ( featureType ) {
		case FEATURE_TYPE_JETPACK_ANTI_SPAM:
			return productHasAntiSpam( productSlug );
		case FEATURE_TYPE_JETPACK_ACTIVITY_LOG:
			return productHasActivityLog( productSlug );
		case FEATURE_TYPE_JETPACK_BACKUP:
			return productHasBackups( productSlug );
		case FEATURE_TYPE_JETPACK_BOOST:
			return productHasBoost( productSlug );
		case FEATURE_TYPE_JETPACK_SCAN:
			return productHasScan( productSlug );
		case FEATURE_TYPE_JETPACK_SEARCH:
			return productHasSearch( productSlug );
		case FEATURE_TYPE_JETPACK_STATS:
			return productHasStats( productSlug );
		case FEATURE_TYPE_JETPACK_VIDEOPRESS:
			return productHasVideoPress( productSlug );
	}
	return false;
};
