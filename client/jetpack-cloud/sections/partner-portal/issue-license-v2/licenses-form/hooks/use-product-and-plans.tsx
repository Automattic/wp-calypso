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
							!! supported_bundles?.find( ( { quantity } ) => selectedBundleSize === quantity )
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
			plans: getProductsAndPlansByFilter( PRODUCT_FILTER_PLANS, filteredProductsAndBundles ),
			products: getProductsAndPlansByFilter( PRODUCT_FILTER_PRODUCTS, filteredProductsAndBundles ),
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
