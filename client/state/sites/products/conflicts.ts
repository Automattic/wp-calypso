import {
	planHasAtLeastOneFeature,
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_JETPACK_BACKUP_DAILY,
	JETPACK_PLANS,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
	FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
	FEATURE_JETPACK_BACKUP_T1_MONTHLY,
	FEATURE_JETPACK_BACKUP_T1_YEARLY,
	FEATURE_JETPACK_BACKUP_T2_MONTHLY,
	FEATURE_JETPACK_BACKUP_T2_YEARLY,
} from '@automattic/calypso-products';
import { createSelector } from '@automattic/state-utils';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';
import { getSitePlanSlug } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

const DAILY_BACKUP_FEATURES = [
	FEATURE_JETPACK_BACKUP_DAILY_MONTHLY,
	FEATURE_JETPACK_BACKUP_DAILY,
];

const REALTIME_BACKUP_FEATURES = [
	FEATURE_JETPACK_BACKUP_REALTIME_MONTHLY,
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_JETPACK_BACKUP_T1_MONTHLY,
	FEATURE_JETPACK_BACKUP_T1_YEARLY,
	FEATURE_JETPACK_BACKUP_T2_MONTHLY,
	FEATURE_JETPACK_BACKUP_T2_YEARLY,
];

/**
 * Check is a Jetpack plan is including a daily backup feature.
 *
 * @param {string} planSlug The plan slug.
 * @returns {boolean} True if the plan includes a daily backup feature.
 */
export const planHasDailyBackup = ( planSlug: string ): boolean =>
	planHasAtLeastOneFeature( planSlug, DAILY_BACKUP_FEATURES );

/**
 * Check is a Jetpack plan is including a real-time backup feature.
 *
 * @param {string} planSlug The plan slug.
 * @returns {boolean} True if the plan includes a real-time backup feature.
 */
export const planHasRealTimeBackup = ( planSlug: string ): boolean =>
	planHasAtLeastOneFeature( planSlug, REALTIME_BACKUP_FEATURES );

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

		const capabilities = getRewindCapabilities( state, siteId );
		const siteHasBackup = Array.isArray( capabilities ) && capabilities.includes( 'backup' );
		const siteHasRealTimeBackup =
			Array.isArray( capabilities ) && capabilities.includes( 'backup-realtime' );

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
			getRewindCapabilities( state, siteId ),
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

		const DAILY_BACKUP_PRODUCTS = [
			PRODUCT_JETPACK_BACKUP_DAILY,
			PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		];

		const REALTIME_BACKUP_PRODUCTS = [
			PRODUCT_JETPACK_BACKUP_REALTIME,
			PRODUCT_JETPACK_BACKUP_T1_YEARLY,
			PRODUCT_JETPACK_BACKUP_T2_YEARLY,
			PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
			PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
			PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
		];

		if ( DAILY_BACKUP_PRODUCTS.includes( productSlug ) ) {
			return planHasDailyBackup( sitePlanSlug );
		}

		if ( REALTIME_BACKUP_PRODUCTS.includes( productSlug ) ) {
			return planHasRealTimeBackup( sitePlanSlug );
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
