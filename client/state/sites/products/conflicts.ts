import {
	FEATURE_JETPACK_ANTI_SPAM,
	FEATURE_JETPACK_ANTI_SPAM_MONTHLY,
	FEATURE_JETPACK_BACKUP_DAILY,
	FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
	FEATURE_JETPACK_BACKUP_T1_MONTHLY,
	FEATURE_JETPACK_BACKUP_T1_YEARLY,
	FEATURE_JETPACK_BACKUP_T2_MONTHLY,
	FEATURE_JETPACK_BACKUP_T2_YEARLY,
	FEATURE_JETPACK_SCAN_DAILY,
	FEATURE_JETPACK_SCAN_DAILY_MONTHLY,
	isJetpackAntiSpam,
	isJetpackScan,
	JETPACK_PLANS,
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	planHasAtLeastOneFeature,
	planHasSuperiorFeature,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	WPCOM_FEATURES_BACKUPS,
	WPCOM_FEATURES_REAL_TIME_BACKUPS,
} from '@automattic/calypso-products';
import { createSelector } from '@automattic/state-utils';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteProducts, getSitePlanSlug } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

const DAILY_BACKUP_FEATURES = [
	FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
	FEATURE_JETPACK_BACKUP_DAILY,
];

const DAILY_BACKUP_PRODUCTS = [
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
];

const REALTIME_BACKUP_FEATURES = [
	FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_JETPACK_BACKUP_T1_MONTHLY,
	FEATURE_JETPACK_BACKUP_T1_YEARLY,
	FEATURE_JETPACK_BACKUP_T2_MONTHLY,
	FEATURE_JETPACK_BACKUP_T2_YEARLY,
];

const REALTIME_BACKUP_PRODUCTS = [
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
];

const ANTI_SPAM_FEATURES = [ FEATURE_JETPACK_ANTI_SPAM, FEATURE_JETPACK_ANTI_SPAM_MONTHLY ];

const SCAN_FEATURES = [ FEATURE_JETPACK_SCAN_DAILY, FEATURE_JETPACK_SCAN_DAILY_MONTHLY ];

/**
 * Check is a Jetpack plan is including a daily backup feature.
 *
 * @param {string} planSlug The plan slug.
 * @param {boolean} orSuperior When true, also checks plan for superior features.
 * @returns {boolean} True if the plan includes a daily backup feature.
 */
export const planHasDailyBackup = ( planSlug: string, orSuperior = false ): boolean => {
	const hasFeature = planHasAtLeastOneFeature( planSlug, DAILY_BACKUP_FEATURES );
	const hasSuperiorFeature = DAILY_BACKUP_FEATURES.some( ( feature ) =>
		planHasSuperiorFeature( planSlug, feature )
	);

	return orSuperior ? hasFeature || hasSuperiorFeature : hasFeature;
};

/**
 * Check is a Jetpack plan is including a real-time backup feature.
 *
 * @param {string} planSlug The plan slug.
 * @param {boolean} orSuperior When true, also checks plan for superior features.
 * @returns {boolean} True if the plan includes a real-time backup feature.
 */
export const planHasRealTimeBackup = ( planSlug: string, orSuperior = false ): boolean => {
	const hasFeature = planHasAtLeastOneFeature( planSlug, REALTIME_BACKUP_FEATURES );
	const hasSuperiorFeature = REALTIME_BACKUP_FEATURES.some( ( feature ) =>
		planHasSuperiorFeature( planSlug, feature )
	);

	return orSuperior ? hasFeature || hasSuperiorFeature : hasFeature;
};

/**
 * Check is a Jetpack plan is including an anti-spam feature.
 *
 * @param {string} planSlug The plan slug.
 * @param {boolean} orSuperior When true, also checks plan for superior features.
 * @returns {boolean} True if the plan includes an anti-spam feature.
 */
export const planHasAntiSpam = ( planSlug: string, orSuperior = false ): boolean => {
	const hasFeature = planHasAtLeastOneFeature( planSlug, ANTI_SPAM_FEATURES );
	const hasSuperiorFeature = ANTI_SPAM_FEATURES.some( ( feature ) =>
		planHasSuperiorFeature( planSlug, feature )
	);

	return orSuperior ? hasFeature || hasSuperiorFeature : hasFeature;
};

/**
 * Check is a Jetpack plan is including a scan feature.
 *
 * @param {string} planSlug The plan slug.
 * @param {boolean} orSuperior When true, also checks plan for superior features.
 * @returns {boolean} True if the plan includes a scan feature.
 */
export const planHasScan = ( planSlug: string, orSuperior = false ): boolean => {
	const hasFeature = planHasAtLeastOneFeature( planSlug, SCAN_FEATURES );
	const hasSuperiorFeature = SCAN_FEATURES.some( ( feature ) =>
		planHasSuperiorFeature( planSlug, feature )
	);

	return orSuperior ? hasFeature || hasSuperiorFeature : hasFeature;
};

/**
 * Check if a Jetpack plan is including a Backup product a site might already have.
 *
 * @param {AppState} state The redux state.
 * @param {number} siteId The site ID.
 * @param {string} planSlug The plan slug.
 * @returns {boolean|null} True if the plan includes the Backup product, or null when it's unable to be determined.
 */
export const isPlanIncludingSiteBackup = createSelector(
	( state: AppState, siteId: number | null, planSlug: string ): boolean | null => {
		if ( ! siteId || ! ( JETPACK_PLANS as ReadonlyArray< string > ).includes( planSlug ) ) {
			return null;
		}

		const siteHasBackup = siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS );
		const siteHasRealTimeBackup = siteHasFeature( state, siteId, WPCOM_FEATURES_REAL_TIME_BACKUPS );

		if ( ! siteHasBackup && ! siteHasRealTimeBackup ) {
			return false;
		}

		if ( siteHasRealTimeBackup && planHasRealTimeBackup( planSlug ) ) {
			return true;
		}

		if ( siteHasBackup && ! siteHasRealTimeBackup && planHasDailyBackup( planSlug ) ) {
			return true;
		}

		return false;
	},
	[
		( state: AppState, siteId: number | null, planSlug: string ) => [
			siteId,
			planSlug,
			siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS ),
			siteHasFeature( state, siteId, WPCOM_FEATURES_REAL_TIME_BACKUPS ),
		],
	]
);

/**
 * Check if a Backup product is already included in a site plan.
 *
 * @param {AppState} state The redux state.
 * @param {number} siteId The site ID.
 * @param {string} productSlug The product slug.
 * @returns {boolean|null} True if the product is already included in a plan, or null when it's unable to be determined.
 */
export const isBackupProductIncludedInSitePlan = createSelector(
	( state: AppState, siteId: number | null, productSlug: string ): boolean | null => {
		if ( ! siteId ) {
			return null;
		}

		const sitePlanSlug = getSitePlanSlug( state, siteId );

		if (
			! sitePlanSlug ||
			! ( JETPACK_PLANS as ReadonlyArray< string > ).includes( sitePlanSlug )
		) {
			return null;
		}

		if ( DAILY_BACKUP_PRODUCTS.includes( productSlug ) ) {
			return planHasDailyBackup( sitePlanSlug, true );
		}

		if ( REALTIME_BACKUP_PRODUCTS.includes( productSlug ) ) {
			return planHasRealTimeBackup( sitePlanSlug, true );
		}

		return null;
	},
	[
		( state: AppState, siteId: number | null, productSlug: string ) => [
			siteId,
			productSlug,
			getSitePlanSlug( state, siteId ),
		],
	]
);

/**
 * Check if a Jetpack plan is including an Anti-Spam product a site might already have.
 *
 * @param {AppState} state The redux state.
 * @param {number} siteId The site ID.
 * @param {string} planSlug The plan slug.
 * @returns {boolean|null} True if the plan includes the Anti-Spam product, or null when it's unable to be determined.
 */
export const isPlanIncludingSiteAntiSpam = createSelector(
	( state: AppState, siteId: number | null, planSlug: string ): boolean | null => {
		if ( ! siteId || ! ( JETPACK_PLANS as ReadonlyArray< string > ).includes( planSlug ) ) {
			return null;
		}

		const products = getSiteProducts( state, siteId ) || [];
		const siteProducts = products.filter( ( p ) => ! p.expired );

		const sitePlanSlug = getSitePlanSlug( state, siteId );
		const siteHasAntiSpam = Boolean(
			( sitePlanSlug && planHasAntiSpam( sitePlanSlug ) ) || siteProducts.find( isJetpackAntiSpam )
		);

		return siteHasAntiSpam && planHasAntiSpam( planSlug );
	},
	[
		( state: AppState, siteId: number | null, planSlug: string ) => [
			siteId,
			planSlug,
			getSitePlanSlug( state, siteId ),
			getSiteProducts( state, siteId ),
		],
	]
);

/**
 * Check if an Anti-Spam product is already included in a site plan.
 *
 * @param {AppState} state The redux state.
 * @param {number} siteId The site ID.
 * @param {string} productSlug The product slug.
 * @returns {boolean|null} True if the product is already included in a plan, or null when it's unable to be determined.
 */
export const isAntiSpamProductIncludedInSitePlan = createSelector(
	( state: AppState, siteId: number | null, productSlug: string ): boolean | null => {
		if ( ! siteId ) {
			return null;
		}

		const sitePlanSlug = getSitePlanSlug( state, siteId );

		if (
			! sitePlanSlug ||
			! ( JETPACK_PLANS as ReadonlyArray< string > ).includes( sitePlanSlug )
		) {
			return null;
		}

		if ( ( JETPACK_ANTI_SPAM_PRODUCTS as ReadonlyArray< string > ).includes( productSlug ) ) {
			return planHasAntiSpam( sitePlanSlug, true );
		}

		return null;
	},
	[
		( state: AppState, siteId: number | null, productSlug: string ) => [
			siteId,
			productSlug,
			getSitePlanSlug( state, siteId ),
		],
	]
);

/**
 * Check if a Jetpack plan is including a Scan product a site might already have.
 *
 * @param {AppState} state The redux state.
 * @param {number} siteId The site ID.
 * @param {string} planSlug The plan slug.
 * @returns {boolean|null} True if the plan includes the Scan product, or null when it's unable to be determined.
 */
export const isPlanIncludingSiteScan = createSelector(
	( state: AppState, siteId: number | null, planSlug: string ): boolean | null => {
		if ( ! siteId || ! ( JETPACK_PLANS as ReadonlyArray< string > ).includes( planSlug ) ) {
			return null;
		}

		const products = getSiteProducts( state, siteId ) || [];
		const siteProducts = products.filter( ( p ) => ! p.expired );

		const sitePlanSlug = getSitePlanSlug( state, siteId );
		const siteHasScan = Boolean(
			( !! sitePlanSlug && planHasScan( sitePlanSlug ) ) || siteProducts.find( isJetpackScan )
		);

		return siteHasScan && planHasScan( planSlug );
	},
	[
		( state: AppState, siteId: number | null, planSlug: string ) => [
			siteId,
			planSlug,
			getSitePlanSlug( state, siteId ),
			getSiteProducts( state, siteId ),
		],
	]
);

/**
 * Check if a Scan product is already included in a site plan.
 *
 * @param {AppState} state The redux state.
 * @param {number} siteId The site ID.
 * @param {string} productSlug The product slug.
 * @returns {boolean|null} True if the product is already included in a plan, or null when it's unable to be determined.
 */
export const isScanProductIncludedInSitePlan = createSelector(
	( state: AppState, siteId: number | null, productSlug: string ): boolean | null => {
		if ( ! siteId ) {
			return null;
		}

		const sitePlanSlug = getSitePlanSlug( state, siteId );

		if (
			! sitePlanSlug ||
			! ( JETPACK_PLANS as ReadonlyArray< string > ).includes( sitePlanSlug )
		) {
			return null;
		}

		if ( ( JETPACK_SCAN_PRODUCTS as ReadonlyArray< string > ).includes( productSlug ) ) {
			return planHasScan( sitePlanSlug, true );
		}

		return null;
	},
	[
		( state: AppState, siteId: number | null, productSlug: string ) => [
			siteId,
			productSlug,
			getSitePlanSlug( state, siteId ),
		],
	]
);
