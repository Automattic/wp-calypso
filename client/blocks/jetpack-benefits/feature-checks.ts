import {
	FEATURE_ALL_PREMIUM_FEATURES_JETPACK,
	FEATURE_JETPACK_ANTI_SPAM,
	FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
	FEATURE_JETPACK_BACKUP_DAILY,
	FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
	FEATURE_JETPACK_SCAN_DAILY,
	FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
	FEATURE_JETPACK_SEARCH,
	FEATURE_JETPACK_SEARCH_MONTHLY,
	isJetpackAntiSpamSlug,
	isJetpackBackupSlug,
	isJetpackPlanSlug,
	isJetpackScanSlug,
	JETPACK_SEARCH_PRODUCTS,
	planHasFeature,
} from '@automattic/calypso-products';

export const productHasBackups = ( productSlug: string ) => {
	return (
		// standalone backup product
		isJetpackBackupSlug( productSlug ) ||
		// check plans for Jetpack backup features
		( isJetpackPlanSlug( productSlug ) &&
			( planHasFeature( productSlug, FEATURE_JETPACK_BACKUP_DAILY ) ||
				planHasFeature( productSlug, FEATURE_JETPACK_BACKUP_DAILY_MONTHLY ) ||
				planHasFeature( productSlug, FEATURE_JETPACK_BACKUP_REALTIME ) ||
				planHasFeature( productSlug, FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY ) ) )
	);
};

export const productHasScan = ( productSlug: string ) => {
	return (
		// standalone scan product
		isJetpackScanSlug( productSlug ) ||
		// check plans for Jetpack scan features
		( isJetpackPlanSlug( productSlug ) &&
			( planHasFeature( productSlug, FEATURE_JETPACK_SCAN_DAILY ) ||
				planHasFeature( productSlug, FEATURE_JETPACK_SCAN_DAILY_MONTHLY ) ) )
	);
};

export const productHasSearch = ( productSlug: string ) => {
	return (
		// standalone search product
		// there is not currently a isJetpackSearchSlug
		JETPACK_SEARCH_PRODUCTS.includes( productSlug ) ||
		// check plans for Jetpack search features
		( isJetpackPlanSlug( productSlug ) &&
			( planHasFeature( productSlug, FEATURE_JETPACK_SEARCH ) ||
				planHasFeature( productSlug, FEATURE_JETPACK_SEARCH_MONTHLY ) ||
				// This is a bit obscure - checks specifically for Jetpack Business (Professional)
				// Is it an error that the plan spec in plans-list.js does not contain search features?
				planHasFeature( productSlug, FEATURE_ALL_PREMIUM_FEATURES_JETPACK ) ) )
	);
};

export const productHasAntiSpam = ( productSlug: string ) => {
	// check that this product is standalone anti-spam or one of the plans that contains it
	return (
		// standalone anti-spam product
		isJetpackAntiSpamSlug( productSlug ) ||
		// check plans for anti-spam features
		( isJetpackPlanSlug( productSlug ) &&
			( planHasFeature( productSlug, FEATURE_JETPACK_ANTI_SPAM ) ||
				planHasFeature( productSlug, FEATURE_JETPACK_ANTI_SPAM_MONTHLY ) ) )
	);
};

export const productHasActivityLog = ( productSlug: string ) => {
	// Any site with Jetpack free will have the activity log
	// Highlighting the log here just for backup products or paid plans, since there are more benefits in these cases (more history, finding previous backups)
	return isJetpackPlanSlug( productSlug ) || isJetpackBackupSlug( productSlug );
};
