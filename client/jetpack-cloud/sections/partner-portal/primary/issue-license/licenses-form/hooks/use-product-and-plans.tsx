import { getQueryArg } from '@wordpress/url';
import { useMemo } from 'react';
import {
	isWooCommerceProduct,
	isWpcomHostingProduct,
} from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import { useSelector } from 'calypso/state';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getAssignedPlanAndProductIDsForSite } from 'calypso/state/partner-portal/licenses/selectors';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import {
	PRODUCT_FILTER_ALL,
	PRODUCT_FILTER_PLANS,
	PRODUCT_FILTER_PRODUCTS,
	PRODUCT_FILTER_VAULTPRESS_BACKUP_ADDONS,
	PRODUCT_FILTER_WOOCOMMERCE_EXTENSIONS,
} from '../../constants';
import { isProductMatch } from '../../lib/filter';
import type { SiteDetails } from '@automattic/data-stores';

// Plans and Products that we can merged into 1 card.
const MERGABLE_PLANS = [ 'jetpack-security' ];
const MERGABLE_PRODUCTS = [ 'jetpack-backup' ];

type Props = {
	selectedBundleSize?: number;
	selectedSite?: SiteDetails | null;
	selectedProductFilter?: string | null;
	productSearchQuery?: string;
	usePublicQuery?: boolean;
};

const getProductsAndPlansByFilter = (
	filter: string | null,
	allProductsAndPlans?: APIProductFamilyProduct[]
) => {
	switch ( filter ) {
		case PRODUCT_FILTER_PRODUCTS:
			return (
				allProductsAndPlans?.filter(
					( { family_slug } ) =>
						family_slug !== 'jetpack-packs' &&
						family_slug !== 'jetpack-backup-storage' &&
						! isWooCommerceProduct( family_slug ) &&
						! isWpcomHostingProduct( family_slug )
				) || []
			);
		case PRODUCT_FILTER_PLANS:
			return (
				allProductsAndPlans?.filter( ( { family_slug } ) => family_slug === 'jetpack-packs' ) || []
			);

		case PRODUCT_FILTER_VAULTPRESS_BACKUP_ADDONS:
			return (
				allProductsAndPlans
					?.filter( ( { family_slug } ) => family_slug === 'jetpack-backup-storage' )
					.sort( ( a, b ) => a.product_id - b.product_id ) || []
			);

		case PRODUCT_FILTER_WOOCOMMERCE_EXTENSIONS:
			return (
				allProductsAndPlans?.filter( ( { family_slug } ) => isWooCommerceProduct( family_slug ) ) ||
				[]
			);
	}

	return allProductsAndPlans || [];
};

// This function gets the displayable Plans based on how it should be arranged in the listing.
const getDisplayablePlans = ( filteredProductsAndBundles: APIProductFamilyProduct[] ) => {
	const plans = getProductsAndPlansByFilter( PRODUCT_FILTER_PLANS, filteredProductsAndBundles );

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
const getDisplayableProducts = ( filteredProductsAndBundles: APIProductFamilyProduct[] ) => {
	const products = getProductsAndPlansByFilter(
		PRODUCT_FILTER_PRODUCTS,
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

export default function useProductAndPlans( {
	selectedBundleSize = 1,
	selectedSite,
	selectedProductFilter = PRODUCT_FILTER_ALL,
	productSearchQuery,
	usePublicQuery = false,
}: Props ) {
	const { data, isLoading: isLoadingProducts } = useProductsQuery( usePublicQuery );

	const addedPlanAndProducts = useSelector( ( state ) =>
		selectedSite ? getAssignedPlanAndProductIDsForSite( state, selectedSite.ID ) : null
	);

	return useMemo( () => {
		// List only products that is compatible with current bundle size.
		const supportedProducts =
			selectedBundleSize > 1
				? data?.filter(
						( { supported_bundles } ) =>
							supported_bundles?.some?.( ( { quantity } ) => selectedBundleSize === quantity )
				  )
				: data;

		// We pre-filter the list by current selected filter
		let filteredProductsAndBundles = getProductsAndPlansByFilter(
			selectedProductFilter,
			supportedProducts
		);

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
			plans: getDisplayablePlans( filteredProductsAndBundles ),
			products: getDisplayableProducts( filteredProductsAndBundles ),
			backupAddons: getProductsAndPlansByFilter(
				PRODUCT_FILTER_VAULTPRESS_BACKUP_ADDONS,
				filteredProductsAndBundles
			),
			wooExtensions: getProductsAndPlansByFilter(
				PRODUCT_FILTER_WOOCOMMERCE_EXTENSIONS,
				filteredProductsAndBundles
			),
			suggestedProductSlugs,
		};
	}, [
		addedPlanAndProducts,
		data,
		isLoadingProducts,
		selectedBundleSize,
		productSearchQuery,
		selectedProductFilter,
		selectedSite,
	] );
}
