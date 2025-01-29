import { getQueryArg } from '@wordpress/url';
import { useMemo } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { isProductMatch } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/filter';
import { useSelector } from 'calypso/state';
import { getAssignedPlanAndProductIDsForSite } from 'calypso/state/partner-portal/licenses/selectors';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import {
	PRODUCT_TYPE_JETPACK_BACKUP_ADDON,
	PRODUCT_TYPE_JETPACK_PLAN,
	PRODUCT_TYPE_JETPACK_PRODUCT,
	PRODUCT_TYPE_PRESSABLE_PLAN,
	PRODUCT_TYPE_WOO_EXTENSION,
	PRODUCT_TYPE_WPCOM_PLAN,
} from '../constants';
import {
	SelectedFilters,
	filterProductsAndPlans,
	filterProductsAndPlansByType,
} from '../lib/product-filter';
import type { SiteDetails } from '@automattic/data-stores';

// Plans and Products that we can merged into 1 card.
const MERGABLE_PLANS = [ 'jetpack-security' ];
const MERGABLE_PRODUCTS = [ 'jetpack-backup' ];

type Props = {
	selectedBundleSize?: number;
	selectedSite?: SiteDetails | null;
	productSearchQuery?: string;
	usePublicQuery?: boolean;
	selectedProductFilters?: SelectedFilters;
};

// This function gets the displayable Plans based on how it should be arranged in the listing.
const getDisplayableJetpackPlans = ( filteredProductsAndBundles: APIProductFamilyProduct[] ) => {
	const plans = filterProductsAndPlansByType(
		PRODUCT_TYPE_JETPACK_PLAN,
		filteredProductsAndBundles
	);

	const filteredPlans = MERGABLE_PLANS.map( ( filter ) => {
		return plans.filter( ( { slug } ) => slug.startsWith( filter ) );
	} )
		.filter( ( subArray ) => subArray.length > 0 ) // Remove empty arrays
		.map( ( mergedPlans ) => ( mergedPlans.length === 1 ? mergedPlans[ 0 ] : mergedPlans ) ); // flat out if only one plan.

	const restOfPlans = plans.filter( ( { slug } ) => {
		return ! MERGABLE_PLANS.some( ( filter ) => slug.startsWith( filter ) );
	} );

	return [ ...filteredPlans, ...restOfPlans ] as APIProductFamilyProduct[];
};

// This function gets the displayable Products based on how it should be arranged in the listing.
const getDisplayableJetpackProducts = ( filteredProductsAndBundles: APIProductFamilyProduct[] ) => {
	const products = filterProductsAndPlansByType(
		PRODUCT_TYPE_JETPACK_PRODUCT,
		filteredProductsAndBundles
	);
	const filteredProducts = MERGABLE_PRODUCTS.map( ( filter ) => {
		return products.filter( ( { slug } ) => slug.startsWith( filter ) );
	} )
		.filter( ( subArray ) => subArray.length > 0 ) // Remove empty arrays
		.map( ( mergedProducts ) =>
			mergedProducts.length === 1 ? mergedProducts[ 0 ] : mergedProducts
		); // flat out if only one product.

	const restOfProducts = products.filter( ( { slug } ) => {
		return ! MERGABLE_PRODUCTS.some( ( filter ) => slug.startsWith( filter ) );
	} );

	return [ ...restOfProducts, ...filteredProducts ].sort( ( a, b ) => {
		const product_a = Array.isArray( a ) ? a[ 0 ].name : a.name;
		const product_b = Array.isArray( b ) ? b[ 0 ].name : b.name;
		return product_a.localeCompare( product_b );
	} ) as APIProductFamilyProduct[];
};

const getDisplayableFeaturedProducts = (
	filteredProductsAndBundles: APIProductFamilyProduct[]
) => {
	const featuredProductSlugs = [
		'woocommerce-advanced-notifications',
		'jetpack-boost',
		'woocommerce-bulk-stock-management',
	]; // For now, we hardcode this until we understand how we want pick featured products.

	return filteredProductsAndBundles.filter( ( product ) =>
		featuredProductSlugs.includes( product.slug )
	);
};

const getDisplayableWoocommerceExtensions = (
	filteredProductsAndBundles: APIProductFamilyProduct[]
) => {
	const extensions = filterProductsAndPlansByType(
		PRODUCT_TYPE_WOO_EXTENSION,
		filteredProductsAndBundles
	);

	return extensions.sort( ( a, b ) => a.name.localeCompare( b.name ) );
};

export default function useProductAndPlans( {
	selectedBundleSize = 1,
	selectedSite,
	selectedProductFilters,
	productSearchQuery,
	usePublicQuery = false,
}: Props ) {
	const { data, isLoading: isLoadingProducts } = useProductsQuery( usePublicQuery );

	const addedPlanAndProducts = useSelector( ( state ) =>
		selectedSite ? getAssignedPlanAndProductIDsForSite( state, selectedSite.ID ) : null
	);

	return useMemo( () => {
		let filteredProductsAndBundles = filterProductsAndPlans( data ?? [], selectedProductFilters );

		// List only products that is compatible with current bundle size.
		filteredProductsAndBundles =
			selectedBundleSize > 1
				? filteredProductsAndBundles?.filter(
						( { supported_bundles } ) =>
							supported_bundles?.some?.( ( { quantity } ) => selectedBundleSize === quantity )
				  )
				: filteredProductsAndBundles;

		// Filter products based on the search term
		if ( productSearchQuery ) {
			filteredProductsAndBundles = filteredProductsAndBundles.filter( ( product ) =>
				isProductMatch( product, productSearchQuery )
			);
		}

		// Filter products & plan that are already assigned to a site
		if ( selectedSite && addedPlanAndProducts && filteredProductsAndBundles ) {
			filteredProductsAndBundles = filteredProductsAndBundles.filter(
				( product ) => ! addedPlanAndProducts.includes( product.product_id )
			);
		}

		// We need the suggested products (i.e., the products chosen from the dashboard) to properly
		// track if the user purchases a different set of products.
		const suggestedProductSlugs = getQueryArg( window.location.href, 'product_slug' )
			?.toString()
			.split( ',' );

		return {
			isLoadingProducts,
			data,
			filteredProductsAndBundles,
			jetpackPlans: getDisplayableJetpackPlans( filteredProductsAndBundles ),
			jetpackProducts: getDisplayableJetpackProducts( filteredProductsAndBundles ),
			jetpackBackupAddons: filterProductsAndPlansByType(
				PRODUCT_TYPE_JETPACK_BACKUP_ADDON,
				filteredProductsAndBundles
			),
			featuredProducts: getDisplayableFeaturedProducts( filteredProductsAndBundles ),
			wooExtensions: getDisplayableWoocommerceExtensions( filteredProductsAndBundles ),
			pressablePlans: filterProductsAndPlansByType(
				PRODUCT_TYPE_PRESSABLE_PLAN,
				filteredProductsAndBundles
			),
			wpcomPlans: filterProductsAndPlansByType(
				PRODUCT_TYPE_WPCOM_PLAN,
				filteredProductsAndBundles
			),
			suggestedProductSlugs,
		};
	}, [
		data,
		selectedProductFilters,
		selectedBundleSize,
		productSearchQuery,
		selectedSite,
		addedPlanAndProducts,
		isLoadingProducts,
	] );
}
