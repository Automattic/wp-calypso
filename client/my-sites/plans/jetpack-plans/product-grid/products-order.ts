import {
	PLAN_JETPACK_SECURITY_T1_YEARLY,
	PLAN_JETPACK_SECURITY_T1_MONTHLY,
	PLAN_JETPACK_SECURITY_T2_YEARLY,
	PLAN_JETPACK_SECURITY_T2_MONTHLY,
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_COMPLETE_PLANS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_VIDEOPRESS_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
} from '@automattic/calypso-products';
import type { JetpackPlanSlug, JetpackProductSlug } from '@automattic/calypso-products';

const setProductsInPosition = ( slugs: ReadonlyArray< string >, position: number ) =>
	slugs.reduce( ( map, slug ) => ( { ...map, [ slug ]: position } ), {} );

const PRODUCT_POSITION_IN_GRID: Record< string, number > = {
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
};

export const getProductPosition = ( slug: JetpackPlanSlug | JetpackProductSlug ): number =>
	PRODUCT_POSITION_IN_GRID[ slug ] ?? 100;
