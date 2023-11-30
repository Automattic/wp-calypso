import { getQueryArg } from '@wordpress/url';
import { useEffect, useMemo } from 'react';
import {
	isJetpackBundle,
	isWooCommerceProduct,
	isWpcomHostingProduct,
} from 'calypso/jetpack-cloud/sections/partner-portal/lib';
import { useDispatch, useSelector } from 'calypso/state';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getAssignedPlanAndProductIDsForSite } from 'calypso/state/partner-portal/licenses/selectors';
import {
	addSelectedProductSlugs,
	clearSelectedProductSlugs,
} from 'calypso/state/partner-portal/products/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import {
	PRODUCT_FILTER_ALL,
	PRODUCT_FILTER_PLANS,
	PRODUCT_FILTER_PRODUCTS,
	PRODUCT_FILTER_VAULTPRESS_BACKUP_ADDONS,
	PRODUCT_FILTER_WOOCOMMERCE_EXTENSIONS,
} from '../../constants';
import type { SiteDetails } from '@automattic/data-stores';

// Plans and Products that we can merged into 1 card.
const MERGABLE_PLANS = [ 'jetpack-security' ];
const MERGABLE_PRODUCTS = [ 'jetpack-backup' ];

type Props = {
	selectedBundleSize?: number;
	selectedSite?: SiteDetails | null;
	selectedProductFilter?: string | null;
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
	} ).filter( ( subArray ) => subArray.length > 0 ); // Remove empty arrays

	const restOfPlans = plans.filter( ( { slug } ) => {
		return ! MERGABLE_PLANS.some( ( filter ) => slug.startsWith( filter ) );
	} );

	return [ ...filteredPlans, ...restOfPlans ];
};

// This function gets the displayable Products based on how it should be arranged in the listing.
const getDisplayableProducts = ( filteredProductsAndBundles: APIProductFamilyProduct[] ) => {
	const products = getProductsAndPlansByFilter(
		PRODUCT_FILTER_PRODUCTS,
		filteredProductsAndBundles
	);
	const filteredProducts = MERGABLE_PRODUCTS.map( ( filter ) => {
		return products.filter( ( { slug } ) => slug.startsWith( filter ) );
	} ).filter( ( subArray ) => subArray.length > 0 ); // Remove empty arrays

	const restOfProducts = products.filter( ( { slug } ) => {
		return ! MERGABLE_PRODUCTS.some( ( filter ) => slug.startsWith( filter ) );
	} );

	return [ ...restOfProducts, ...filteredProducts ].sort( ( a, b ) => {
		const product_a = Array.isArray( a ) ? a[ 0 ].name : a.name;
		const product_b = Array.isArray( b ) ? b[ 0 ].name : b.name;
		return product_a.localeCompare( product_b );
	} );
};

export default function useProductAndPlans( {
	selectedBundleSize = 1,
	selectedSite,
	selectedProductFilter = PRODUCT_FILTER_ALL,
}: Props ) {
	const { data, isLoading: isLoadingProducts } = useProductsQuery();
	const dispatch = useDispatch();

	useEffect( () => {
		// If the user comes from the flow for adding a new payment method during an attempt to issue a license
		// after the payment method is added, we will make an attempt to issue the chosen license automatically.
		const defaultProductSlugs = getQueryArg( window.location.href, 'products' )
			?.toString()
			.split( ',' );
		// Select the slugs included in the URL
		defaultProductSlugs &&
			dispatch(
				addSelectedProductSlugs(
					// Filter the bundles and select only individual products
					defaultProductSlugs.filter( ( slug ) => ! isJetpackBundle( slug ) )
				)
			);

		// Clear all selected slugs when navigating away from the page to avoid persisting the data.
		return () => {
			dispatch( clearSelectedProductSlugs() );
		};
	}, [ dispatch ] );

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
		selectedProductFilter,
		selectedSite,
	] );
}
