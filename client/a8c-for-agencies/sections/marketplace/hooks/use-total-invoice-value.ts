import { isEnabled } from '@automattic/calypso-config';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useContext, useMemo } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import useWPCOMOwnedSites from 'calypso/a8c-for-agencies/hooks/use-wpcom-owned-sites';
import wpcomBulkOptions from 'calypso/a8c-for-agencies/sections/marketplace/lib/wpcom-bulk-options';
import { calculateTier } from 'calypso/a8c-for-agencies/sections/marketplace/lib/wpcom-bulk-values-utils';
import { isWooCommerceProduct } from 'calypso/jetpack-cloud/sections/partner-portal/primary/issue-license/lib/woocommerce-product-slug-mapping';
import { MarketplaceTypeContext } from '../context';
import type { TermPricingType } from '../types';
import type {
	APIProductFamily,
	APIProductFamilyProduct,
	SelectedLicenseProp,
} from 'calypso/a8c-for-agencies/types/products';
import type { ProductListItem } from 'calypso/state/products-list/selectors/get-products-list';

const isTermPricingEnabled = isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' );

export const useGetProductPricingInfo = ( termPricing?: TermPricingType, currency?: string ) => {
	const translate = useTranslate();
	const { data } = useProductsQuery( true );
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
		const termPrice =
			termPricing === 'yearly' ? product.yearly_price ?? 0 : product.monthly_price ?? 0;
		const productPrice = isTermPricingEnabled ? termPrice : Number( product.amount );

		const termPricingText =
			isTermPricingEnabled && termPricing === 'yearly' ? translate( '/yr' ) : translate( '/mo' );

		const productBundlePrice = productPrice * quantity;

		if ( product.family_slug === 'wpcom-hosting' ) {
			const tier = calculateTier( options, quantity + ownedPlans );
			const discountedCost = productBundlePrice * ( 1 - tier.discount );
			return {
				actualCost: productBundlePrice,
				discountedCost,
				discountPercentage: tier.discount,
				showActualCost: productBundlePrice > discountedCost,
				termPricingText,
				discountedCostFormatted: formatCurrency( discountedCost, currency ?? 'USD' ),
				actualCostFormatted: formatCurrency( productBundlePrice, currency ?? 'USD' ),
				isFree: productBundlePrice === 0,
			};
		}

		if ( isTermPricingEnabled ) {
			// TODO: When we enable BD for all the agencies, we will only keep this logic for all the products, remove the rest of the logic.
			const isDailyPricing = product.price_interval === 'day';
			const actualCost = isDailyPricing ? productBundlePrice / 365 : productBundlePrice;
			const discountedCost = productPrice || 0;

			const discountPercentage = discountedCost
				? Math.round( ( ( actualCost - discountedCost ) / actualCost ) * 100 )
				: 100;

			return {
				actualCost,
				discountedCost,
				discountPercentage,
				discountedCostFormatted: formatCurrency( discountedCost, currency ?? 'USD' ),
				actualCostFormatted: formatCurrency( actualCost, currency ?? 'USD' ),
				showActualCost: actualCost > discountedCost,
				termPricingText,
				isFree: actualCost === 0,
			};
		}

		// If we don't have userProducts, we just pull the price from the product and not calculate the discount
		if ( ! Object.keys( userProducts ).length ) {
			const actualCost = Number( product?.price_per_unit_display?.replace( /,/g, '' ) ) ?? 0;
			return {
				actualCost,
				discountedCost: actualCost,
				discountPercentage: 0,
				discountedCostFormatted: formatCurrency( actualCost, currency ?? 'USD' ),
				actualCostFormatted: formatCurrency( actualCost, currency ?? 'USD' ),
				showActualCost: false,
				termPricingText,
				isFree: actualCost === 0,
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

		return {
			actualCost: discountInfo.actualCost,
			discountedCost: discountInfo.discountedCost,
			discountPercentage: discountInfo.discountPercentage,
			discountedCostFormatted: formatCurrency( discountInfo.discountedCost, currency ?? 'USD' ),
			actualCostFormatted: formatCurrency( discountInfo.actualCost, currency ?? 'USD' ),
			showActualCost: discountInfo.actualCost > discountInfo.discountedCost,
			termPricingText,
			isFree: discountInfo.actualCost === 0,
		};
	};
	return { getProductPricingInfo };
};

export const useTotalInvoiceValue = ( termPricing?: TermPricingType, currency?: string ) => {
	const translate = useTranslate();

	const { getProductPricingInfo } = useGetProductPricingInfo( termPricing, currency );

	const getTotalInvoiceValue = (
		userProducts: Record< string, ProductListItem >,
		selectedLicenses: SelectedLicenseProp[]
	) => {
		// Use the reduce function to calculate the total invoice value
		const totalInvoiceValue = selectedLicenses.reduce(
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

		const totalDiscountedCostFormatted =
			isTermPricingEnabled && termPricing === 'yearly'
				? translate( '%(total)s/yr', {
						args: {
							total: formatCurrency( totalInvoiceValue.discountedCost, currency ?? 'USD' ),
						},
				  } )
				: translate( '%(total)s/mo', {
						args: {
							total: formatCurrency( totalInvoiceValue.discountedCost, currency ?? 'USD' ),
						},
				  } );

		return {
			...totalInvoiceValue,
			totalDiscountedCostFormatted,
		};
	};

	return { getTotalInvoiceValue };
};
