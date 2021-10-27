import {
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_COMPLETE_PLANS,
	JETPACK_CRM_FREE_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
} from '@automattic/calypso-products';
import {
	getForCurrentCROIteration,
	Iterations,
} from 'calypso/my-sites/plans/jetpack-plans/iterations';
import type { JetpackPlanSlug, JetpackProductSlug } from '@automattic/calypso-products';

const setProductsInPosition = ( slugs: string[], position: number ) =>
	slugs.reduce( ( map, slug ) => ( { ...map, [ slug ]: position } ), {} );

const ONLY_REALTIME_PRODUCT_POSITION_IN_GRID: Record< string, number > = {
	[ PRODUCT_JETPACK_BACKUP_T1_YEARLY ]: 1,
	[ PRODUCT_JETPACK_BACKUP_T1_MONTHLY ]: 1,
	[ PRODUCT_JETPACK_BACKUP_T2_YEARLY ]: 1,
	[ PRODUCT_JETPACK_BACKUP_T2_MONTHLY ]: 1,
	[ PLAN_JETPACK_SECURITY_T1_YEARLY ]: 10,
	[ PLAN_JETPACK_SECURITY_T1_MONTHLY ]: 10,
	[ PLAN_JETPACK_SECURITY_T2_YEARLY ]: 10,
	[ PLAN_JETPACK_SECURITY_T2_MONTHLY ]: 10,
	...setProductsInPosition( JETPACK_COMPLETE_PLANS, 20 ),
	...setProductsInPosition( JETPACK_ANTI_SPAM_PRODUCTS, 30 ),
	...setProductsInPosition( JETPACK_SEARCH_PRODUCTS, 40 ),
	...setProductsInPosition( JETPACK_SCAN_PRODUCTS, 50 ),
	...setProductsInPosition( JETPACK_VIDEOPRESS_PRODUCTS, 60 ),
	...setProductsInPosition( JETPACK_CRM_FREE_PRODUCTS, 70 ),
	[ PLAN_JETPACK_FREE ]: 80,
};

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
};

export const getProductPosition = ( slug: JetpackPlanSlug | JetpackProductSlug ): number =>
	( getForCurrentCROIteration( {
		[ Iterations.ONLY_REALTIME_PRODUCTS ]: ONLY_REALTIME_PRODUCT_POSITION_IN_GRID,
	} ) ?? PRODUCT_POSITION_IN_GRID )[ slug ] ?? 100;
