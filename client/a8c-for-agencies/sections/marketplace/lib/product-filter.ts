import {
	isWooCommerceProduct,
	isWpcomHostingProduct,
} from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import {
	PRODUCT_BRAND_FILTER_ALL,
	PRODUCT_CATEGORY_CONVERSION,
	PRODUCT_CATEGORY_CUSTOMER_SERVICE,
	PRODUCT_CATEGORY_GROWTH,
	PRODUCT_CATEGORY_JETPACK,
	PRODUCT_CATEGORY_MERCHANDISING,
	PRODUCT_CATEGORY_PAYMENTS,
	PRODUCT_CATEGORY_PERFORMANCE,
	PRODUCT_CATEGORY_SECURITY,
	PRODUCT_CATEGORY_SHIPPING_DELIVERY_FULFILLMENT,
	PRODUCT_CATEGORY_SOCIAL,
	PRODUCT_CATEGORY_STORE_CONTENT,
	PRODUCT_CATEGORY_STORE_MANAGEMENT,
	PRODUCT_CATEGORY_WOOCOMMERCE,
	PRODUCT_FILTER_KEY_BRAND,
	PRODUCT_FILTER_KEY_CATEGORIES,
	PRODUCT_FILTER_KEY_PRICES,
	PRODUCT_FILTER_KEY_TYPES,
	PRODUCT_FILTER_KEY_VENDORS,
	PRODUCT_PRICE_FREE,
	PRODUCT_PRICE_PAID,
	PRODUCT_TYPE_ADDON,
	PRODUCT_TYPE_EXTENSION,
	PRODUCT_TYPE_JETPACK_BACKUP_ADDON,
	PRODUCT_TYPE_JETPACK_PLAN,
	PRODUCT_TYPE_JETPACK_PRODUCT,
	PRODUCT_TYPE_PLAN,
	PRODUCT_TYPE_PRESSABLE_PLAN,
	PRODUCT_TYPE_PRODUCT,
	PRODUCT_TYPE_WOO_EXTENSION,
	PRODUCT_TYPE_WPCOM_PLAN,
} from '../constants';
import { isPressableHostingProduct, isWPCOMHostingProduct } from '../lib/hosting';
import { getVendorInfo } from '../products-overview-v2/lib/get-vendor-info';
import {
	SECURITY_PRODUCT_SLUGS,
	PERFORMANCE_PRODUCT_SLUGS,
	SOCIAL_PRODUCT_SLUGS,
	GROWTH_PRODUCT_SLUGS,
	PAYMENTS_PRODUCT_SLUGS,
	SHIPPING_DELIVERY_FULFILLMENT_PRODUCT_SLUGS,
	CONVERSION_PRODUCT_SLUGS,
	CUSTOMER_SERVICE_PRODUCT_SLUGS,
	MERCHANDISING_PRODUCT_SLUGS,
	STORE_CONTENT_PRODUCT_SLUGS,
	STORE_MANAGEMENT_PRODUCT_SLUGS,
} from './product-slugs';

export type SelectedFilters = {
	[ PRODUCT_FILTER_KEY_BRAND ]: string;
	[ PRODUCT_FILTER_KEY_CATEGORIES ]: Record< string, boolean >;
	[ PRODUCT_FILTER_KEY_TYPES ]: Record< string, boolean >;
	[ PRODUCT_FILTER_KEY_PRICES ]: Record< string, boolean >;
	[ PRODUCT_FILTER_KEY_VENDORS ]: Record< string, boolean >;
};

export function hasSelectedFilter( selectedFilters: SelectedFilters ) {
	return [
		selectedFilters[ PRODUCT_FILTER_KEY_CATEGORIES ],
		selectedFilters[ PRODUCT_FILTER_KEY_VENDORS ],
		selectedFilters[ PRODUCT_FILTER_KEY_TYPES ],
		selectedFilters[ PRODUCT_FILTER_KEY_PRICES ],
	].some( ( filters ) => hasSelectedFilterByType( filters ) );
}

export function hasSelectedFilterByType( filters: Record< string, boolean > ) {
	return Object.values( filters ).some( ( selected ) => selected );
}

export function filterProductsAndPlans(
	productsAndPlans: APIProductFamilyProduct[],
	selectedFilters?: SelectedFilters
) {
	if ( ! selectedFilters ) {
		return productsAndPlans;
	}

	let filteredProductsAndBundles = [];

	// List only products that matches the selected prices.
	filteredProductsAndBundles = filterProductsAndPlansByPrices(
		productsAndPlans,
		getSelectedFilters( PRODUCT_FILTER_KEY_PRICES, selectedFilters )
	);

	// List only products that matches the selected product brand filter.
	filteredProductsAndBundles = filterProductsAndPlansByBrand(
		filteredProductsAndBundles,
		selectedFilters[ PRODUCT_FILTER_KEY_BRAND ]
	);

	// List only products that matches the selected product types.
	filteredProductsAndBundles = filterProductsAndPlansByTypes(
		filteredProductsAndBundles,
		getSelectedFilters( PRODUCT_FILTER_KEY_TYPES, selectedFilters )
	);

	// List only products that matches the selected product categories.
	filteredProductsAndBundles = filterProductsAndPlansByCategories(
		filteredProductsAndBundles,
		getSelectedFilters( PRODUCT_FILTER_KEY_CATEGORIES, selectedFilters )
	);

	// List only products that matches the selected product vendor.
	filteredProductsAndBundles = filterProductsAndPlansByVendors(
		filteredProductsAndBundles,
		getSelectedFilters( PRODUCT_FILTER_KEY_VENDORS, selectedFilters )
	);

	return filteredProductsAndBundles;
}

/*
 * Get selected filters.
 *
 * @param {string} key - Selected filter key.
 * @param {SelectedFilters} selectedFilters - Selected filters.
 * @return {string[]} Selected filters.
 */
function getSelectedFilters( key: string, selectedFilters: SelectedFilters ) {
	const record = selectedFilters[ key as keyof SelectedFilters ] as Record< string, boolean >;
	return Object.keys( record ).filter( ( filter ) => record[ filter ] );
}

/*
 * Filter products and plans by brand.
 *
 * @param {APIProductFamilyProduct[]} productsAndPlans - List of products and plans.
 * @param {string} productBrand - Selected product brand filter.
 * @return {APIProductFamilyProduct[]} Filtered products and plans.
 */
function filterProductsAndPlansByBrand(
	productsAndPlans: APIProductFamilyProduct[],
	productBrand?: string
) {
	const selectedProductBrandFilter = productBrand ?? PRODUCT_BRAND_FILTER_ALL;

	return selectedProductBrandFilter === PRODUCT_BRAND_FILTER_ALL
		? productsAndPlans
		: productsAndPlans.filter( ( { slug } ) => slug.startsWith( selectedProductBrandFilter ) );
}

/*
 * Filter products and plans by types.
 *
 * @param {APIProductFamilyProduct[]} productsAndPlans - List of products and plans.
 * @param {string[]} types - Selected product types.
 * @return {APIProductFamilyProduct[]} Filtered products and plans.
 */
function filterProductsAndPlansByTypes(
	productsAndPlans: APIProductFamilyProduct[],
	types: string[]
) {
	if ( ! types.length ) {
		return productsAndPlans;
	}

	const filteredData: Set< APIProductFamilyProduct > = new Set();

	types.forEach( ( type ) => {
		filterProductsAndPlansByType( type, productsAndPlans ).forEach( ( item ) => {
			filteredData.add( item );
		} );
	} );

	return Array.from( filteredData );
}

/*
 * Filter products and plans by prices.
 *
 * @param {APIProductFamilyProduct[]} productsAndPlans - List of products and plans.
 * @param {string[]} prices - Selected product prices.
 * @return {APIProductFamilyProduct[]} Filtered products and plans.
 */
function filterProductsAndPlansByPrices(
	productsAndPlans: APIProductFamilyProduct[],
	prices: string[]
) {
	if ( prices.length === 1 ) {
		if ( prices[ 0 ] === PRODUCT_PRICE_FREE ) {
			return productsAndPlans.filter( ( { amount } ) => Number( amount ) === 0 );
		}

		if ( prices[ 0 ] === PRODUCT_PRICE_PAID ) {
			return productsAndPlans.filter( ( { amount } ) => Number( amount ) > 0 );
		}
	}

	return productsAndPlans;
}

/*
 * Filter products and plans by categories.
 *
 * @param {APIProductFamilyProduct[]} productsAndPlans - List of products and plans.
 * @param {string[]} categories - Selected product categories.
 * @return {APIProductFamilyProduct[]} Filtered products and plans.
 */
function filterProductsAndPlansByCategories(
	productAndPlans: APIProductFamilyProduct[],
	categories: string[]
) {
	if ( ! categories.length ) {
		return productAndPlans;
	}

	const filteredData: Set< APIProductFamilyProduct > = new Set();

	categories.forEach( ( category ) => {
		filterProductsAndPlansByCategory( category, productAndPlans ).forEach( ( item ) => {
			filteredData.add( item );
		} );
	} );

	return Array.from( filteredData );
}

/*
 * Filter products and plans by vendors.
 *
 * @param {APIProductFamilyProduct[]} productsAndPlans - List of products and plans.
 * @param {string[]} vendors - Selected product vendors.
 * @return {APIProductFamilyProduct[]} Filtered products and plans.
 */
function filterProductsAndPlansByVendors(
	productsAndPlans: APIProductFamilyProduct[],
	vendors: string[]
) {
	if ( ! vendors.length ) {
		return productsAndPlans;
	}

	const filteredData: Set< APIProductFamilyProduct > = new Set();

	vendors.forEach( ( vendor ) => {
		filterProductsAndPlansByVendor( vendor, productsAndPlans ).forEach( ( item ) => {
			filteredData.add( item );
		} );
	} );

	return Array.from( filteredData );
}

export const isProductType = ( family_slug: string ) => {
	return (
		family_slug !== 'jetpack-packs' &&
		family_slug !== 'jetpack-backup-storage' &&
		! isWooCommerceProduct( family_slug ) &&
		! isWpcomHostingProduct( family_slug ) &&
		! isPressableHostingProduct( family_slug )
	);
};

/*
 * Filter products and plans by type.
 *
 * @param {string} filter - Selected product type filter.
 * @param {APIProductFamilyProduct[]} allProductsAndPlans - List of products and plans.
 * @return {APIProductFamilyProduct[]} Filtered products and plans.
 */
export function filterProductsAndPlansByType(
	type: string | null,
	allProductsAndPlans?: APIProductFamilyProduct[]
) {
	switch ( type ) {
		case PRODUCT_TYPE_JETPACK_PRODUCT:
		case PRODUCT_TYPE_PRODUCT: // Right now this is the same as jetpack product but once we have more non-jetpack products we can separate them.
			return (
				allProductsAndPlans?.filter( ( { family_slug } ) => isProductType( family_slug ) ) || []
			);
		case PRODUCT_TYPE_JETPACK_PLAN:
		case PRODUCT_TYPE_PLAN: // Right now this is the same as jetpack plan but once we have more non-jetpack plans we can separate them.
			return (
				allProductsAndPlans?.filter( ( { family_slug } ) => family_slug === 'jetpack-packs' ) || []
			);

		case PRODUCT_TYPE_JETPACK_BACKUP_ADDON:
		case PRODUCT_TYPE_ADDON: // Right now this is the same as jetpack backup addons but once we have more non-jetpack addons we can separate them.
			return (
				allProductsAndPlans
					?.filter( ( { family_slug } ) => family_slug === 'jetpack-backup-storage' )
					.sort( ( a, b ) => a.product_id - b.product_id ) || []
			);

		case PRODUCT_TYPE_WOO_EXTENSION:
		case PRODUCT_TYPE_EXTENSION:
			return (
				allProductsAndPlans?.filter( ( { family_slug } ) => isWooCommerceProduct( family_slug ) ) ||
				[]
			);
		case PRODUCT_TYPE_PRESSABLE_PLAN:
			return (
				allProductsAndPlans?.filter( ( { family_slug } ) =>
					isPressableHostingProduct( family_slug )
				) || []
			);
		case PRODUCT_TYPE_WPCOM_PLAN:
			return (
				allProductsAndPlans?.filter( ( { family_slug } ) =>
					isWPCOMHostingProduct( family_slug )
				) || []
			);
	}

	return allProductsAndPlans || [];
}

/*
 * Filter products and plans by category.
 *
 * @param {string} category - Selected product category filter.
 * @param {APIProductFamilyProduct[]} allProductsAndPlans - List of products and plans.
 * @return {APIProductFamilyProduct[]} Filtered products and plans.
 */
function filterProductsAndPlansByCategory(
	category: string,
	allProductsAndPlans: APIProductFamilyProduct[]
) {
	switch ( category ) {
		case PRODUCT_CATEGORY_JETPACK:
			return (
				allProductsAndPlans?.filter(
					( { family_slug } ) =>
						! isWooCommerceProduct( family_slug ) &&
						! isWpcomHostingProduct( family_slug ) &&
						! isPressableHostingProduct( family_slug )
				) || []
			);
		case PRODUCT_CATEGORY_WOOCOMMERCE:
			return (
				allProductsAndPlans?.filter( ( { family_slug } ) => isWooCommerceProduct( family_slug ) ) ||
				[]
			);
		case PRODUCT_CATEGORY_SECURITY:
			return allProductsAndPlans.filter(
				( { slug, family_slug } ) =>
					SECURITY_PRODUCT_SLUGS.includes( family_slug ) || slug === 'jetpack-complete'
			);
		case PRODUCT_CATEGORY_PERFORMANCE:
			return allProductsAndPlans.filter(
				( { slug, family_slug } ) =>
					PERFORMANCE_PRODUCT_SLUGS.includes( family_slug ) || slug === 'jetpack-complete'
			);
		case PRODUCT_CATEGORY_SOCIAL:
			return allProductsAndPlans.filter(
				( { slug, family_slug } ) =>
					SOCIAL_PRODUCT_SLUGS.includes( family_slug ) || slug === 'jetpack-complete'
			);
		case PRODUCT_CATEGORY_GROWTH:
			return allProductsAndPlans.filter(
				( { slug, family_slug } ) =>
					GROWTH_PRODUCT_SLUGS.includes( family_slug ) || slug === 'jetpack-complete'
			);
		case PRODUCT_CATEGORY_PAYMENTS:
			return allProductsAndPlans.filter( ( { family_slug } ) =>
				PAYMENTS_PRODUCT_SLUGS.includes( family_slug )
			);
		case PRODUCT_CATEGORY_SHIPPING_DELIVERY_FULFILLMENT:
			return allProductsAndPlans.filter( ( { family_slug } ) =>
				SHIPPING_DELIVERY_FULFILLMENT_PRODUCT_SLUGS.includes( family_slug )
			);
		case PRODUCT_CATEGORY_CONVERSION:
			return allProductsAndPlans.filter( ( { family_slug } ) =>
				CONVERSION_PRODUCT_SLUGS.includes( family_slug )
			);
		case PRODUCT_CATEGORY_CUSTOMER_SERVICE:
			return allProductsAndPlans.filter( ( { family_slug } ) =>
				CUSTOMER_SERVICE_PRODUCT_SLUGS.includes( family_slug )
			);
		case PRODUCT_CATEGORY_MERCHANDISING:
			return allProductsAndPlans.filter( ( { family_slug } ) =>
				MERCHANDISING_PRODUCT_SLUGS.includes( family_slug )
			);
		case PRODUCT_CATEGORY_STORE_CONTENT:
			return allProductsAndPlans.filter( ( { family_slug } ) =>
				STORE_CONTENT_PRODUCT_SLUGS.includes( family_slug )
			);
		case PRODUCT_CATEGORY_STORE_MANAGEMENT:
			return allProductsAndPlans.filter( ( { family_slug } ) =>
				STORE_MANAGEMENT_PRODUCT_SLUGS.includes( family_slug )
			);
	}

	return allProductsAndPlans;
}

/*
 * Filter products and plans by vendor.
 *
 * @param {string} vendor - Selected product vendor filter.
 * @param {APIProductFamilyProduct[]} allProductsAndPlans - List of products and plans.
 * @return {APIProductFamilyProduct[]} Filtered products and plans.
 */
function filterProductsAndPlansByVendor(
	vendor: string,
	allProductsAndPlans: APIProductFamilyProduct[]
) {
	return allProductsAndPlans.filter( ( { slug } ) => getVendorInfo( slug )?.vendorSlug === vendor );
}
