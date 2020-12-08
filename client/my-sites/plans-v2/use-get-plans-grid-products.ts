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
	JETPACK_BACKUP_PRODUCTS,
	PRODUCT_JETPACK_BACKUP_DAILY,
	PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY,
	PRODUCT_JETPACK_BACKUP_REALTIME,
	PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_PRODUCTS_LIST,
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_CRM_MONTHLY,
} from 'calypso/lib/products-values/constants';
import { getJetpackCROActiveVersion } from 'calypso/my-sites/plans-v2/abtest';
import {
	OPTIONS_JETPACK_BACKUP,
	OPTIONS_JETPACK_BACKUP_MONTHLY,
} from 'calypso/my-sites/plans-v2/constants';
import getSitePlan from 'calypso/state/sites/selectors/get-site-plan';
import getSiteProducts from 'calypso/state/sites/selectors/get-site-products';
import { slugToSelectorProduct } from './utils';

const useSelectorPageProducts = ( siteId: number | null ) => {
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
	if (
		! ownedProducts.some( ( ownedProduct ) =>
			[ PRODUCT_JETPACK_CRM, PRODUCT_JETPACK_CRM_MONTHLY ].includes( ownedProduct )
		)
	) {
		availableProducts = [ ...availableProducts, PRODUCT_JETPACK_CRM, PRODUCT_JETPACK_CRM_MONTHLY ];
	}

	const backupProductsToShow = [];
	const currentCROvariant = getJetpackCROActiveVersion();
	// In v0 (Offer Reset), we show the Backup product the site owns or the Jetpack Backup option card.
	if ( currentCROvariant === 'v0' ) {
		if (
			! ownedProducts.some( ( ownedProduct ) => JETPACK_BACKUP_PRODUCTS.includes( ownedProduct ) )
		) {
			backupProductsToShow.push( OPTIONS_JETPACK_BACKUP, OPTIONS_JETPACK_BACKUP_MONTHLY );
		}

		// In v1, we show the Backup product the site owns or Jetpack Backup Daily.
	} else if ( currentCROvariant === 'v1' ) {
		if (
			! ownedProducts.some( ( ownedProduct ) => JETPACK_BACKUP_PRODUCTS.includes( ownedProduct ) )
		) {
			backupProductsToShow.push(
				PRODUCT_JETPACK_BACKUP_DAILY,
				PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY
			);
		}
		// We show the Backup product the site owns and the one the site doesn't own. In other words,
		// we always show both Backup Daily and Backup Real-time.
	} else {
		if (
			! ownedProducts.some( ( ownedProduct ) =>
				[ PRODUCT_JETPACK_BACKUP_DAILY, PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY ].includes(
					ownedProduct
				)
			)
		) {
			backupProductsToShow.push(
				PRODUCT_JETPACK_BACKUP_DAILY,
				PRODUCT_JETPACK_BACKUP_DAILY_MONTHLY
			);
		}

		if (
			! ownedProducts.some( ( ownedProduct ) =>
				[ PRODUCT_JETPACK_BACKUP_REALTIME, PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY ].includes(
					ownedProduct
				)
			)
		) {
			backupProductsToShow.push(
				PRODUCT_JETPACK_BACKUP_REALTIME,
				PRODUCT_JETPACK_BACKUP_REALTIME_MONTHLY
			);
		}
	}
	availableProducts = [ ...availableProducts, ...backupProductsToShow ];

	// If Jetpack Backup is directly or indirectly owned, continue, otherwise make it available by displaying
	// the option cards.

	// If Jetpack Scan is directly or indirectly owned, continue, otherwise make it available.
	if (
		! ownedProducts.some( ( ownedProduct ) => JETPACK_SCAN_PRODUCTS.includes( ownedProduct ) )
	) {
		availableProducts = [ ...availableProducts, ...JETPACK_SCAN_PRODUCTS ];
	}

	// If Jetpack Anti-spam is directly or indirectly owned, continue, otherwise make it available.
	if (
		! ownedProducts.some( ( ownedProduct ) => JETPACK_ANTI_SPAM_PRODUCTS.includes( ownedProduct ) )
	) {
		availableProducts = [ ...availableProducts, ...JETPACK_ANTI_SPAM_PRODUCTS ];
	}

	return {
		availableProducts: availableProducts.map( slugToSelectorProduct ),
		purchasedProducts: purchasedProducts.map( slugToSelectorProduct ),
		includedInPlanProducts: includedInPlanProducts.map( slugToSelectorProduct ),
	};
};

export default useSelectorPageProducts;
