import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T1_YEARLY,
	PRODUCT_JETPACK_BACKUP_T1_MONTHLY,
	PRODUCT_JETPACK_BACKUP_T2_YEARLY,
	PRODUCT_JETPACK_BACKUP_T2_MONTHLY,
	PRODUCT_JETPACK_SCAN,
	PRODUCT_JETPACK_SCAN_MONTHLY,
	JETPACK_CRM_FREE_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_PRODUCTS_LIST,
	JETPACK_VIDEOPRESS_PRODUCTS,
	getPlan,
} from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import {
	doForCurrentCROIteration,
	Iterations,
} from 'calypso/my-sites/plans/jetpack-plans/iterations';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSiteProducts from 'calypso/state/sites/selectors/get-site-products';
import slugToSelectorProduct from './slug-to-selector-product';
import type { PlanGridProducts, SelectorProduct } from './types';

const useSelectorPageProducts = ( siteId: number | null ): PlanGridProducts => {
	let availableProducts: string[] = [];

	// Products/features included in the current plan
	const currentPlan =
		useSelector( ( state ) => getSitePlan( state, siteId ) )?.product_slug || null;
	const includedInPlanProducts: string[] =
		( currentPlan && getPlan( currentPlan )?.getIncludedFeatures() ) || [];

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

	const backupProductsToShow: string[] = [];

	doForCurrentCROIteration( ( key ) => {
		if ( Iterations.ONLY_REALTIME_PRODUCTS === key ) {
			const ownsBackupT1 =
				ownedProducts.includes( PRODUCT_JETPACK_BACKUP_T1_YEARLY ) ||
				ownedProducts.includes( PRODUCT_JETPACK_BACKUP_T1_MONTHLY );
			const ownsBackupT2 =
				ownedProducts.includes( PRODUCT_JETPACK_BACKUP_T2_YEARLY ) ||
				ownedProducts.includes( PRODUCT_JETPACK_BACKUP_T2_MONTHLY );

			// If neither T1 or T2 backups are owned, then show T1 backups.
			// Otherwise the one owned will be displayed via purchasedProducts.
			if ( ! ownsBackupT1 && ! ownsBackupT2 ) {
				backupProductsToShow.push(
					PRODUCT_JETPACK_BACKUP_T1_YEARLY,
					PRODUCT_JETPACK_BACKUP_T1_MONTHLY
				);
			}
		} else {
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

			if ( ! ownsRealtime ) {
				backupProductsToShow.push(
					PRODUCT_JETPACK_BACKUP_REALTIME,
					PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY
				);
			}
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

	// If Jetpack VideoPress is directly or indirectly owned, continue, otherwise make it available.
	if (
		! ownedProducts.some( ( ownedProduct ) => JETPACK_VIDEOPRESS_PRODUCTS.includes( ownedProduct ) )
	) {
		availableProducts = [ ...availableProducts, ...JETPACK_VIDEOPRESS_PRODUCTS ];
	}

	// Show Jetpack CRM free products
	doForCurrentCROIteration( ( key ) => {
		if ( Iterations.ONLY_REALTIME_PRODUCTS === key ) {
			availableProducts = [ ...availableProducts, ...JETPACK_CRM_FREE_PRODUCTS ];
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
