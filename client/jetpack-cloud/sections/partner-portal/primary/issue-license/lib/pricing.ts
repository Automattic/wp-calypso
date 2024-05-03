import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { isWooCommerceProduct } from './woocommerce-product-slug-mapping';
import type { SelectedLicenseProp } from '../types';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

// This function calculates the pricing information for a given product.
export const getProductPricingInfo = (
	userProducts: Record< string, ProductListItem >,
	product: SelectedLicenseProp | APIProductFamilyProduct,
	quantity: number
) => {
	const bundle = product?.supported_bundles?.find( ( bundle ) => bundle.quantity === quantity );
	const bundleAmount = bundle && bundle.amount ? bundle.amount.replace( ',', '' ) : '';

	const productBundleCost = bundle
		? parseFloat( bundleAmount )
		: parseFloat( product?.amount ) || 0;
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
						isWooCommerceProduct( p.billing_product_slug, yearlyProduct.billing_product_slug ) ) &&
					p.product_term === 'month'
				);
			} );

		// If a monthly product is found, calculate the actual cost and discount percentage
		if ( monthlyProduct ) {
			const monthlyProductBundleCost = parseFloat( product.amount ) * quantity;
			const actualCost = isDailyPricing ? monthlyProductBundleCost / 365 : monthlyProductBundleCost;
			const discountedCost = actualCost - productBundleCost;
			discountInfo.discountPercentage = productBundleCost
				? Math.round( ( discountedCost / actualCost ) * 100 )
				: 100;
			discountInfo.actualCost = actualCost;
		}
	}
	return discountInfo;
};

// Calculate the actual cost based on the product quantity
export const getTotalInvoiceValue = (
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
