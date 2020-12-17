/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import { planHasFeature, planHasSuperiorFeature } from 'calypso/lib/plans';
import {
	FEATURE_JETPACK_BACKUP_REALTIME,
	FEATURE_JETPACK_BACKUP_DAILY,
	JETPACK_PLANS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_PERSONAL_MONTHLY,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_COMPLETE_MONTHLY,
} from 'calypso/lib/plans/constants';
import {
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
} from 'calypso/lib/products-values/constants';
import { hasSiteProduct, getSitePlanSlug } from 'calypso/state/sites/selectors';

/**
 * Type dependencies
 */
import type { AppState } from 'calypso/types';

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
		if ( ! siteId || ! JETPACK_PLANS.includes( planSlug ) ) {
			return null;
		}

		const hasDailyBackup = hasSiteProduct( state, siteId, [
			PRODUCT_JETPACK_BACKUP_DAILY,
			PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
		] );
		const hasRealTimeBackup = hasSiteProduct( state, siteId, [
			PRODUCT_JETPACK_BACKUP_REALTIME,
			PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
		] );

		if ( ! hasDailyBackup && ! hasRealTimeBackup ) {
			return false;
		}

		switch ( planSlug ) {
			case PLAN_JETPACK_FREE:
				return false;
			case PLAN_JETPACK_PERSONAL:
			case PLAN_JETPACK_PERSONAL_MONTHLY:
			case PLAN_JETPACK_PREMIUM:
			case PLAN_JETPACK_PREMIUM_MONTHLY:
			case PLAN_JETPACK_SECURITY_DAILY:
			case PLAN_JETPACK_SECURITY_DAILY_MONTHLY:
				if ( hasRealTimeBackup ) {
					return false;
				}
				return true;
			case PLAN_JETPACK_BUSINESS:
			case PLAN_JETPACK_BUSINESS_MONTHLY:
			case PLAN_JETPACK_SECURITY_REALTIME:
			case PLAN_JETPACK_SECURITY_REALTIME_MONTHLY:
			case PLAN_JETPACK_COMPLETE:
			case PLAN_JETPACK_COMPLETE_MONTHLY:
				return true;
		}

		return false;
	},
	[
		( state: AppState, siteId: number | null, planSlug: string ) => [
			siteId,
			planSlug,
			hasSiteProduct( state, siteId, [
				PRODUCT_JETPACK_BACKUP_DAILY,
				PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
			] ),
			hasSiteProduct( state, siteId, [
				PRODUCT_JETPACK_BACKUP_REALTIME,
				PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
			] ),
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

		if ( ! sitePlanSlug || ! JETPACK_PLANS.includes( sitePlanSlug ) ) {
			return null;
		}

		let feature;

		if (
			[ PRODUCT_JETPACK_BACKUP_DAILY, PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ].includes( productSlug )
		) {
			feature = FEATURE_JETPACK_BACKUP_DAILY;
		} else if (
			[ PRODUCT_JETPACK_BACKUP_REALTIME, PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ].includes(
				productSlug
			)
		) {
			feature = FEATURE_JETPACK_BACKUP_REALTIME;
		} else {
			return null;
		}

		return (
			planHasFeature( sitePlanSlug, feature ) || planHasSuperiorFeature( sitePlanSlug, feature )
		);
	},
	[
		( state: AppState, siteId: number | null, productSlug: string ) => [
			siteId,
			productSlug,
			getSitePlanSlug( state, siteId ),
		],
	]
);
