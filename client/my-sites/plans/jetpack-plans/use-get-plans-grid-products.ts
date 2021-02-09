/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { getPlan } from 'calypso/lib/plans';
import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_PRODUCTS_LIST,
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_CRM_MONTHLY,
} from 'calypso/lib/products-values/constants';
import { doForCurrentCROIteration, Iterations } from './iterations';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSiteProducts from 'calypso/state/sites/selectors/get-site-products';
import { slugToSelectorProduct } from './utils';

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
	doForCurrentCROIteration( ( variation: Iterations ) => {
		if (
			variation !== Iterations.SPP &&
			! ownedProducts.some( ( ownedProduct ) =>
				[ PRODUCT_JETPACK_CRM, PRODUCT_JETPACK_CRM_MONTHLY ].includes( ownedProduct )
			)
		) {
			availableProducts = [
				...availableProducts,
				PRODUCT_JETPACK_CRM,
				PRODUCT_JETPACK_CRM_MONTHLY,
			];
		}
	} );

	const backupProductsToShow: string[] = [];
	doForCurrentCROIteration( ( variation: Iterations ) => {
		const ownsDaily =
			ownedProducts.includes( PRODUCT_JETPACK_BACKUP_DAILY ) ||
			ownedProducts.includes( PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY );
		const ownsRealtime =
			ownedProducts.includes( PRODUCT_JETPACK_BACKUP_REALTIME ) ||
			ownedProducts.includes( PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY );

		// Show the Backup product the site owns, and the one it doesn't own.
		// In other words, always show both Backup Daily and Backup Real-time.
		if ( ! ownsDaily ) {
			backupProductsToShow.push(
				PRODUCT_JETPACK_BACKUP_DAILY,
				PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY
			);
		}

		// ... except in the SPP iteration, which only shows
		// Backup Real-time if the site owns it.

		if ( variation !== Iterations.SPP && ! ownsRealtime ) {
			backupProductsToShow.push(
				PRODUCT_JETPACK_BACKUP_REALTIME,
				PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY
			);
		}
	} );

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

	return {
		availableProducts: availableProducts.map( slugToSelectorProduct ) as SelectorProduct[],
		purchasedProducts: purchasedProducts.map( slugToSelectorProduct ) as SelectorProduct[],
		includedInPlanProducts: includedInPlanProducts.map(
			slugToSelectorProduct
		) as SelectorProduct[],
	};
};

export default useSelectorPageProducts;
