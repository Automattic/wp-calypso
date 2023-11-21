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
import type { SiteDetails } from '@automattic/data-stores';

type Props = {
	selectedSite?: SiteDetails | null;
};

export default function useProductAndPlans( { selectedSite }: Props ) {
	const { data, isLoading: isLoadingProducts } = useProductsQuery();
	const dispatch = useDispatch();

	// If the user comes from the flow for adding a new payment method during an attempt to issue a license
	// after the payment method is added, we will make an attempt to issue the chosen license automatically.
	const defaultProductSlugs = getQueryArg( window.location.href, 'products' )
		?.toString()
		.split( ',' );

	useEffect( () => {
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
	}, [ dispatch, defaultProductSlugs ] );

	let allProductsAndBundles = data;
	const addedPlanAndProducts = useSelector( ( state ) =>
		selectedSite ? getAssignedPlanAndProductIDsForSite( state, selectedSite.ID ) : null
	);

	// Filter products & plan that are already assigned to a site
	if ( selectedSite && addedPlanAndProducts && allProductsAndBundles ) {
		allProductsAndBundles = allProductsAndBundles.filter(
			( product ) => ! addedPlanAndProducts.includes( product.product_id )
		);
	}

	return useMemo( () => {
		const bundles =
			allProductsAndBundles?.filter(
				( { family_slug }: { family_slug: string } ) => family_slug === 'jetpack-packs'
			) || [];
		const backupAddons =
			allProductsAndBundles
				?.filter(
					( { family_slug }: { family_slug: string } ) => family_slug === 'jetpack-backup-storage'
				)
				.sort( ( a, b ) => a.product_id - b.product_id ) || [];
		const products =
			allProductsAndBundles?.filter(
				( { family_slug }: { family_slug: string } ) =>
					family_slug !== 'jetpack-packs' &&
					family_slug !== 'jetpack-backup-storage' &&
					! isWooCommerceProduct( family_slug ) &&
					! isWpcomHostingProduct( family_slug )
			) || [];
		const wooExtensions =
			allProductsAndBundles?.filter( ( { family_slug }: { family_slug: string } ) =>
				isWooCommerceProduct( family_slug )
			) || [];

		// We need the suggested products (i.e., the products chosen from the dashboard) to properly
		// track if the user purchases a different set of products.
		const suggestedProductSlugs = getQueryArg( window.location.href, 'product_slug' )
			?.toString()
			.split( ',' );

		return {
			isLoadingProducts,
			allProductsAndBundles,
			bundles,
			backupAddons,
			products,
			wooExtensions,
			suggestedProductSlugs,
		};
	}, [ allProductsAndBundles, isLoadingProducts ] );
}
