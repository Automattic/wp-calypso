/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP,
	PRODUCT_JETPACK_BACKUP_MONTHLY,
	PRODUCT_JETPACK_BACKUP_PRO,
	PRODUCT_JETPACK_BACKUP_PRO_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_PRODUCTS_LIST,
	JETPACK_CRM_FREE_PRODUCTS,
	getPlan,
} from '@automattic/calypso-products';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSiteProducts from 'calypso/state/sites/selectors/get-site-products';
import {
	getForCurrentCROIteration,
	doForCurrentCROIteration,
	Iterations,
} from 'calypso/my-sites/plans/jetpack-plans/iterations';
import slugToSelectorProduct from './slug-to-selector-product';

/**
 * Type dependencies
 */
import type { PlanGridProducts, SelectorProduct } from './types';

const useSelectorPageProducts = ( siteId: number | null ): PlanGridProducts => {
	let availableProducts: string[] = [];

	// Products/features included in the current plan
	const currentPlan =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;
	const includedInPlanProducts: string[] =
		( currentPlan && getPlan( currentPlan )?.getHiddenFeatures() ) || [];

	// Owned products from direct purchases
	const purchasedProducts =
		useSelector( ( state ) => getSiteProducts( state, siteId ) )
			?.map( ( { productSlug } ) => productSlug )
			.filter( ( productSlug ) => JETPACK_PRODUCTS_LIST.includes( productSlug ) ) ?? [];

	// Directly and indirectly owned products
	const ownedProducts = [ ...purchasedProducts, ...includedInPlanProducts ];

	// If Jetpack Search is directly or indirectly owned, continue, otherwise make it available.
	if (
		! ownedProducts.some( ( ownedProduct ) => JETPACK_SEARCH_PRODUCTS.includes( ownedProduct ) )
	) {
		availableProducts = [ ...availableProducts, ...JETPACK_SEARCH_PRODUCTS ];
	}

	// Include Jetpack CRM
	const includeCrmFree =
		getForCurrentCROIteration( {
			[ Iterations.ONLY_REALTIME_PRODUCTS ]: false,
		} ) ?? true;
	if (
		includeCrmFree &&
		! ownedProducts.some( ( ownedProduct ) => JETPACK_CRM_FREE_PRODUCTS.includes( ownedProduct ) )
	) {
		availableProducts = [ ...availableProducts, ...JETPACK_CRM_FREE_PRODUCTS ];
	}

	const backupProductsToShow: string[] = [];

	const ownsDaily =
		ownedProducts.includes( PRODUCT_JETPACK_BACKUP_DAILY ) ||
		ownedProducts.includes( PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY );
	const ownsRealtime =
		ownedProducts.includes( PRODUCT_JETPACK_BACKUP_REALTIME ) ||
		ownedProducts.includes( PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY );

	// Show the Backup product the site owns, and the one it doesn't own.
	// In other words, always show both Backup Daily and Backup Real-time.
	if ( ! ownsDaily ) {
		backupProductsToShow.push( PRODUCT_JETPACK_BACKUP_DAILY, PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY );
	}

	if ( ! ownsRealtime ) {
		backupProductsToShow.push(
			PRODUCT_JETPACK_BACKUP_REALTIME,
			PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY
		);
	}

	availableProducts = [ ...availableProducts, ...backupProductsToShow ];

	// If Jetpack Backup is directly or indirectly owned, continue, otherwise make it available by displaying
	// the option cards.

	// If Jetpack Scan is directly or indirectly owned, continue, otherwise make it available.
	if (
		! ownedProducts.some( ( ownedProduct ) => JETPACK_SCAN_PRODUCTS.includes( ownedProduct ) )
	) {
		availableProducts = [
			...availableProducts,
			...[ PRODUCT_JETPACK_SCAN, PRODUCT_JETPACK_SCAN_MONTHLY ],
		];
	}

	// If Jetpack Anti-spam is directly or indirectly owned, continue, otherwise make it available.
	if (
		! ownedProducts.some( ( ownedProduct ) => JETPACK_ANTI_SPAM_PRODUCTS.includes( ownedProduct ) )
	) {
		availableProducts = [ ...availableProducts, ...JETPACK_ANTI_SPAM_PRODUCTS ];
	}

	// Replace backup products with their new versions for the ONLY_REALTIME_PRODUCTS iteration
	doForCurrentCROIteration( ( key ) => {
		if ( Iterations.ONLY_REALTIME_PRODUCTS === key ) {
			const backupReplacement: { [ key: string ]: string } = {
				[ PRODUCT_JETPACK_BACKUP_DAILY ]: PRODUCT_JETPACK_BACKUP,
				[ PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ]: PRODUCT_JETPACK_BACKUP_MONTHLY,
				[ PRODUCT_JETPACK_BACKUP_REALTIME ]: PRODUCT_JETPACK_BACKUP_PRO,
				[ PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ]: PRODUCT_JETPACK_BACKUP_PRO_MONTHLY,
			};

			for ( const oldBackupProduct in backupReplacement ) {
				for ( const productsArray of [
					availableProducts,
					purchasedProducts,
					includedInPlanProducts,
				] ) {
					const index = productsArray.indexOf( oldBackupProduct );
					if ( -1 !== index ) {
						productsArray[ index ] = backupReplacement[ oldBackupProduct ];
					}
				}
			}
		}
	} );

	return {
		availableProducts: availableProducts.map( slugToSelectorProduct ) as SelectorProduct[],
		purchasedProducts: purchasedProducts.map( slugToSelectorProduct ) as SelectorProduct[],
		includedInPlanProducts: includedInPlanProducts.map(
			slugToSelectorProduct
		) as SelectorProduct[],
	};
};

export default useSelectorPageProducts;
