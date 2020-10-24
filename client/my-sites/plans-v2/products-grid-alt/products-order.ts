/**
 * Internal dependencies
 */
import { getJetpackCROActiveVersion } from 'calypso/my-sites/plans-v2/abtest';
import {
	PLAN_JETPACK_SECURITY_DAILY,
	PLAN_JETPACK_SECURITY_DAILY_MONTHLY,
	PLAN_JETPACK_SECURITY_REALTIME,
	PLAN_JETPACK_SECURITY_REALTIME_MONTHLY,
	JETPACK_COMPLETE_PLANS,
} from 'calypso/lib/plans/constants';
import {
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_CRM_PRODUCTS,
	JETPACK_ANTI_SPAM_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
} from 'calypso/lib/products-values/constants';

const setProductsInPosition = ( slugs: string[], position: number ) =>
	slugs.reduce( ( map, slug ) => ( { ...map, [ slug ]: position } ), {} );

const PRODUCT_POSITION_IN_GRID_V1 = {
	[ PLAN_JETPACK_SECURITY_DAILY ]: 1,
	[ PLAN_JETPACK_SECURITY_DAILY_MONTHLY ]: 1,
	[ PLAN_JETPACK_SECURITY_REALTIME ]: 10,
	[ PLAN_JETPACK_SECURITY_REALTIME_MONTHLY ]: 10,
	[ PRODUCT_JETPACK_BACKUP_DAILY ]: 20,
	[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: 20,
	[ PRODUCT_JETPACK_BACKUP_REALTIME ]: 25,
	[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: 25,
	...setProductsInPosition( JETPACK_SCAN_PRODUCTS, 30 ),
	...setProductsInPosition( JETPACK_SEARCH_PRODUCTS, 40 ),
	...setProductsInPosition( JETPACK_CRM_PRODUCTS, 50 ),
	...setProductsInPosition( JETPACK_ANTI_SPAM_PRODUCTS, 60 ),
	...setProductsInPosition( JETPACK_COMPLETE_PLANS, 70 ),
};

const PRODUCT_POSITION_IN_GRID_V2 = {
	...PRODUCT_POSITION_IN_GRID_V1,
	...setProductsInPosition( JETPACK_COMPLETE_PLANS, 15 ),
	...setProductsInPosition( JETPACK_ANTI_SPAM_PRODUCTS, 30 ),
	...setProductsInPosition( JETPACK_SCAN_PRODUCTS, 40 ),
	...setProductsInPosition( JETPACK_SEARCH_PRODUCTS, 60 ),
};

export function getProductPosition( slug: string ): number {
	const currentCROvariant = getJetpackCROActiveVersion();
	switch ( currentCROvariant ) {
		case 'v1':
			return PRODUCT_POSITION_IN_GRID_V1[ slug ];
		case 'v2':
			return PRODUCT_POSITION_IN_GRID_V2[ slug ];
		default:
			return 100;
	}
}
