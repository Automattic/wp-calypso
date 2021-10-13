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
	isJetpackAntiSpamSlug,
	isJetpackBackupSlug,
	isJetpackPlanSlug,
	isJetpackScanSlug,
	isJetpackSearchSlug,
	planHasAtLeastOneFeature,
} from '@automattic/calypso-products';

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

export const productHasActivityLog = ( productSlug: string ): boolean => {
	// Any site with Jetpack free will have the activity log
	// Highlighting the log here just for backup products or paid plans, since there are more benefits in these cases (more history, finding previous backups)
	return isJetpackPlanSlug( productSlug ) || isJetpackBackupSlug( productSlug );
};
