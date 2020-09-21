/**
 * External dependencies
 */
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { slugToSelectorProduct } from './utils';
import { getPlan } from 'lib/plans';
import {
	JETPACK_ANTI_SPAM_PRODUCTS,
	JETPACK_BACKUP_PRODUCTS,
	JETPACK_SCAN_PRODUCTS,
	JETPACK_SEARCH_PRODUCTS,
	JETPACK_PRODUCTS_LIST,
	PRODUCT_JETPACK_CRM,
	PRODUCT_JETPACK_CRM_MONTHLY,
} from 'lib/products-values/constants';
import {
	OPTIONS_JETPACK_BACKUP,
	OPTIONS_JETPACK_BACKUP_MONTHLY,
} from 'my-sites/plans-v2/constants';
import getSitePlan from 'state/sites/selectors/get-site-plan';
import getSiteProducts from 'state/sites/selectors/get-site-products';

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

	// If Jetpack Backup is directly or indirectly owned, continue, otherwise make it available by displaying
	// the option cards.
	if (
		! ownedProducts.some( ( ownedProduct ) => JETPACK_BACKUP_PRODUCTS.includes( ownedProduct ) )
	) {
		availableProducts = [
			...availableProducts,
			OPTIONS_JETPACK_BACKUP,
			OPTIONS_JETPACK_BACKUP_MONTHLY,
		];
	}

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
