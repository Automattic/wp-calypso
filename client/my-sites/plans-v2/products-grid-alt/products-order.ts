/**
 * Internal dependencies
 */
import { getJetpackCROActiveVersion } from 'calypso/my-sites/plans-v2/abtest';
import {
	JETPACK_COMPLETE_PLANS,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
} from 'calypso/lib/plans/constants';
import {
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_CRM_PRODUCTS,
	JETPACK_ANTI_SPAM_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
} from 'calypso/lib/products-values/constants';

export function getProductPosition( slug: string ): number {
	if ( [ PLAN_JETPACK_SECURITY_DAILY, PLAN_JETPACK_SECURITY_DAILY_MONTHLY ].includes( slug ) ) {
		return 1;
	} else if (
		[ PLAN_JETPACK_SECURITY_REALTIME, PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ].includes( slug )
	) {
		return 10;
	} else if (
		[ PRODUCT_JETPACK_BACKUP_DAILY, PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ].includes( slug )
	) {
		return 20;
	} else if ( JETPACK_BACKUP_PRODUCTS.includes( slug ) ) {
		return 25;
	} else if ( JETPACK_SCAN_PRODUCTS.includes( slug ) ) {
		return 30;
	} else if ( JETPACK_SEARCH_PRODUCTS.includes( slug ) ) {
		return 40;
	} else if ( JETPACK_CRM_PRODUCTS.includes( slug ) ) {
		return 50;
	} else if ( JETPACK_ANTI_SPAM_PRODUCTS.includes( slug ) ) {
		return 60;
	} else if ( JETPACK_COMPLETE_PLANS.includes( slug ) ) {
		return getJetpackCROActiveVersion() === 'v1' ? 70 : 15;
	}
	return 100;
}
