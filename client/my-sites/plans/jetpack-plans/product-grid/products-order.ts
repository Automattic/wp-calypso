/**
 * Internal dependencies
 */
import {
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	JETPACK_COMPLETE_PLANS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_CRM_FREE_PRODUCTS,
	JETPACK_ANTI_SPAM_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
} from '@automattic/calypso-products';

/**
 * Type dependencies
 */
import type { JetpackProductSlug } from '@automattic/calypso-products';
import type { JetpackPlanSlugs } from '@automattic/calypso-products';

const setProductsInPosition = ( slugs: string[], position: number ) =>
	slugs.reduce( ( map, slug ) => ( { ...map, [ slug ]: position } ), {} );

const PRODUCT_POSITION_IN_GRID: Record< string, number > = {
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: 1,
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: 1,
	[ PLAN_JETPACK_SECURITY_DAILY ]: 10,
	[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ]: 10,
	...setProductsInPosition( JETPACK_COMPLETE_PLANS, 20 ),
	[ PLAN_JETPACK_SECURITY_REALTIME ]: 30,
	[ PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ]: 30,
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: 40,
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: 40,
	...setProductsInPosition( JETPACK_SCAN_PRODUCTS, 50 ),
	...setProductsInPosition( JETPACK_ANTI_SPAM_PRODUCTS, 60 ),
	...setProductsInPosition( JETPACK_SEARCH_PRODUCTS, 70 ),
	...setProductsInPosition( JETPACK_CRM_FREE_PRODUCTS, 80 ),
};

export const getProductPosition = ( slug: JetpackPlanSlugs | JetpackProductSlug ): number =>
	PRODUCT_POSITION_IN_GRID[ slug ] ?? 100;
