import { useContext, useMemo } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import useWPCOMOwnedSites from 'calypso/a8c-for-agencies/hooks/use-wpcom-owned-sites';
import wpcomBulkOptions from 'calypso/a8c-for-agencies/sections/marketplace/wpcom-overview/lib/wpcom-bulk-options';
import { calculateTier } from 'calypso/a8c-for-agencies/sections/marketplace/wpcom-overview/lib/wpcom-bulk-values-utils';
import { isWooCommerceProduct } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/woocommerce-product-slug-mapping';
import { SelectedLicenseProp } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/types';
import { APIProductFamily, APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';
import { MarketplaceTypeContext } from '../../context';

export const useGetProductPricingInfo = () => {
	const { data } = useProductsQuery( false, true );
	const wpcomProducts = data?.find(
		( product ) => product.slug === 'wpcom-hosting'
	) as unknown as APIProductFamily;
	const options = useMemo(
		() => wpcomBulkOptions( wpcomProducts?.discounts?.tiers ),
		[ wpcomProducts?.discounts?.tiers ]
	);
	const { count } = useWPCOMOwnedSites();
	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const ownedPlans = useMemo( () => {
		// We don't count ownded plans when referring products
		if ( marketplaceType === 'referral' ) {
			return 0;
		}

		return count;
	}, [ count, marketplaceType ] );

	const getProductPricingInfo = (
		userProducts: Record< string, ProductListItem >,
		product: SelectedLicenseProp | APIProductFamilyProduct,
		quantity: number
	) => {
		if ( product.family_slug === 'wpcom-hosting' ) {
			const tier = calculateTier( options, quantity + ownedPlans );
			const actualCost = Number( product.amount ) * quantity;
			return {
				actualCost,
				discountedCost: actualCost * ( 1 - tier.discount ),
				discountPercentage: tier.discount,
			};
		}

		// If we don't have userProducts, we just pull the price from the product and not calculate the discount
		if ( ! Object.keys( userProducts ).length ) {
			const actualCost = Number( product?.price_per_unit_display?.replace( /,/g, '' ) ) ?? 0;
			return {
				actualCost,
				discountedCost: actualCost,
				discountPercentage: 0,
			};
		}

		const bundle = product?.supported_bundles?.find( ( bundle ) => bundle.quantity === quantity );
		const bundleAmount = bundle && bundle.amount ? bundle.amount.replace( ',', '' ) : '';

		const productBundleCost = bundle
			? parseFloat( bundleAmount )
			: parseFloat( product?.amount.replace( ',', '' ) ) || 0;
		const isDailyPricing = product.price_interval === 'day';

		const discountInfo: {
			actualCost: number;
			discountedCost: number;
			discountPercentage: number;
		} = {
			actualCost: 0,
			discountedCost: productBundleCost, // This is the discounted cost based on the product quantity
			discountPercentage: 0,
		};
		if ( Object.keys( userProducts ).length && product ) {
			// Find the yearly version of the product in userProducts
			const yearlyProduct = Object.values( userProducts ).find(
				( prod ) => prod.product_id === product.product_id
			);

			// If a yearly product is found, find the monthly version of the product
			const monthlyProduct =
				yearlyProduct &&
				Object.values( userProducts ).find( ( p ) => {
					return (
						( p.billing_product_slug === yearlyProduct.billing_product_slug ||
							// Check if the product is a WooCommerce product
							isWooCommerceProduct(
								p.billing_product_slug,
								yearlyProduct.billing_product_slug
							) ) &&
						p.product_term === 'month'
					);
				} );

			// If a monthly product is found, calculate the actual cost and discount percentage
			if ( monthlyProduct ) {
				const monthlyProductBundleCost = parseFloat( product.amount.replace( ',', '' ) ) * quantity;
				const actualCost = isDailyPricing
					? monthlyProductBundleCost / 365
					: monthlyProductBundleCost;
				const discountedCost = actualCost - productBundleCost;
				discountInfo.discountPercentage = productBundleCost
					? Math.round( ( discountedCost / actualCost ) * 100 )
					: 100;
				discountInfo.actualCost = actualCost;
			}
		}
		return discountInfo;
	};
	return { getProductPricingInfo };
};

export const useTotalInvoiceValue = () => {
	const { getProductPricingInfo } = useGetProductPricingInfo();

	const getTotalInvoiceValue = (
		userProducts: Record< string, ProductListItem >,
		selectedLicenses: SelectedLicenseProp[]
	) => {
		// Use the reduce function to calculate the total invoice value
		return selectedLicenses.reduce(
			( acc, license ) => {
				// Get the pricing information for the current license
				const { actualCost, discountedCost, discountPercentage } = getProductPricingInfo(
					userProducts,
					license,
					license.quantity
				);

				// Add the actual cost, discounted cost, and discount percentage to the accumulator
				acc.actualCost += actualCost;
				acc.discountedCost += discountedCost;
				acc.discountPercentage += discountPercentage;
				return acc;
			},
			{
				actualCost: 0,
				discountedCost: 0,
				discountPercentage: 0,
			}
		);
	};

	return { getTotalInvoiceValue };
};
