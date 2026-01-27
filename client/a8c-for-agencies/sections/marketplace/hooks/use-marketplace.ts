import { isEnabled } from '@automattic/calypso-config';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useContext, useMemo } from 'react';
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

/**
 * Calculates the discount percentage between an original price and a discounted price.
 * @param originalPrice - The original price before discount
 * @param discountedPrice - The price after discount
 * @returns The discount percentage (0-100), or 0 if originalPrice is 0 or negative
 */
export const calculateDiscountPercentage = (
	originalPrice: number,
	discountedPrice: number
): number => {
	if ( originalPrice <= 0 ) {
		return 0;
	}
	return Math.round( ( ( originalPrice - discountedPrice ) / originalPrice ) * 100 );
};

export const getWPCOMTieredPrice = (
	product: APIProductFamilyProduct,
	quantity: number,
	termPricing: TermPricingType,
	ownedPlans = 0
) => {
	// Calculate actual cost (base product price * quantity)
	const basePricePerUnit =
		termPricing === 'yearly' ? product.yearly_price ?? 0 : product.monthly_price ?? 0;
	const actualCost = basePricePerUnit * quantity;
	const tierPrices =
		termPricing === 'yearly' ? product.tier_yearly_prices : product.tier_monthly_prices;
	const tierQuantity = quantity + ownedPlans;

	// Find tier for exact quantity, or get the greatest unit that is less than or equal to tierQuantity
	const tier =
		tierPrices?.find( ( t ) => t.units === tierQuantity ) ||
		tierPrices
			?.filter( ( t ) => t.units <= tierQuantity )
			.sort( ( a, b ) => b.units - a.units )[ 0 ];

	// Get price per unit from tier if found, otherwise from product
	let pricePerUnit: number;
	if ( tier ) {
		pricePerUnit = tier.price;
	} else {
		pricePerUnit = basePricePerUnit;
	}

	const discountedCost = pricePerUnit * quantity;
	// Calculate discount percentage from per-unit prices for consistency
	// This ensures the percentage matches the tier structure and is consistent across quantities
	// and currencies, avoiding rounding errors from multiplication
	const discountPercentage = calculateDiscountPercentage( basePricePerUnit, pricePerUnit );

	return {
		actualCost,
		discountedCost,
		discountPercentage,
	};
};

export const checkProductTermAvailability = (
	product: APIProductFamilyProduct,
	termPricing?: TermPricingType
) => {
	const monthlyProductId = product?.monthly_product_id;
	const yearlyProductId = product?.yearly_product_id;
	const isMonthlyTerm = termPricing === 'monthly';
	const isYearlyTerm = termPricing === 'yearly';
	const isMissingMonthlyId = isMonthlyTerm && ! monthlyProductId;
	const isMissingYearlyId = isYearlyTerm && ! yearlyProductId;
	return { isMissingMonthlyId, isMissingYearlyId };
};

export const useProductTermAvailabilityTooltip = ( termPricing: TermPricingType ) => {
	const translate = useTranslate();

	const termAvailabilityTooltip = useCallback(
		( product: APIProductFamilyProduct ) => {
			const { isMissingMonthlyId, isMissingYearlyId } = checkProductTermAvailability(
				product,
				termPricing
			);

			if ( isMissingMonthlyId ) {
				return translate(
					'This product is not available for monthly billing. We will bill you yearly instead.'
				);
			}

			if ( isMissingYearlyId ) {
				return translate(
					'This product is not available for yearly billing. We will bill you monthly instead.'
				);
			}

			return undefined;
		},
		[ termPricing, translate ]
	);

	return termAvailabilityTooltip;
};

export const useTermPricingText = ( termPricing?: TermPricingType, short = true ) => {
	const isTermPricingEnabled = isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' );
	const translate = useTranslate();
	const yearlyText = short ? translate( '/yr' ) : translate( '/year' );
	const monthlyText = short ? translate( '/mo' ) : translate( '/month' );
	return isTermPricingEnabled && termPricing === 'yearly' ? yearlyText : monthlyText;
};

export const useGetProductPricingInfo = (
	termPricing?: TermPricingType,
	currency?: string
): {
	getProductPricingInfo: (
		userProducts: Record< string, ProductListItem >,
		product: SelectedLicenseProp | APIProductFamilyProduct,
		quantity: number
	) => {
		actualCost: number;
		discountedCost: number;
		discountPercentage: number;
		discountedCostFormatted: string;
		actualCostFormatted: string;
		showActualCost: boolean;
		isFree: boolean;
	};
	termPricingPriceInfo: ( product: APIProductFamilyProduct ) => {
		priceInterval: string;
		termPrice: number | undefined;
	};
} => {
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

	const termPricingPriceInfo = ( product: APIProductFamilyProduct ) => {
		const { isMissingMonthlyId, isMissingYearlyId } = checkProductTermAvailability(
			product,
			termPricing
		);
		let priceInterval =
			termPricing === 'yearly' ? translate( 'per year' ) : translate( 'per month' );
		let termPrice = termPricing === 'yearly' ? product.yearly_price : product.monthly_price;
		if ( isMissingMonthlyId ) {
			// We manually calculate the monthly price based on the yearly price
			termPrice = ( product.yearly_price || 0 ) / 12;
			priceInterval = translate( 'per month, billed yearly' );
		} else if ( isMissingYearlyId ) {
			// We manually calculate the yearly price based on the monthly price
			termPrice = ( product.monthly_price || 0 ) * 12;
			priceInterval = translate( 'per year, billed monthly' );
		}
		return { priceInterval, termPrice };
	};

	const getProductPricingInfo = (
		userProducts: Record< string, ProductListItem >,
		product: SelectedLicenseProp | APIProductFamilyProduct,
		quantity: number
	) => {
		const isTermPricingEnabled =
			isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' );
		const { termPrice } = termPricingPriceInfo( product );
		const productPrice = isTermPricingEnabled ? termPrice : Number( product.amount );

		const productBundlePrice = productPrice ? productPrice * quantity : 0;

		if ( product.family_slug === 'wpcom-hosting' ) {
			let actualCost: number;
			let discountedCost: number;
			let discountPercentage: number;

			if ( isTermPricingEnabled && termPricing ) {
				const pricingInfo = getWPCOMTieredPrice( product, quantity, termPricing, ownedPlans );
				actualCost = pricingInfo.actualCost;
				discountedCost = pricingInfo.discountedCost;
				discountPercentage = pricingInfo.discountPercentage;
			} else {
				// Fallback to discount tier calculation when term pricing is not enabled
				const tier = calculateTier( options, quantity + ownedPlans );
				actualCost = productBundlePrice;
				discountedCost = productBundlePrice * ( 1 - tier.discount );
				discountPercentage = Math.round( tier.discount * 100 );
			}

			return {
				actualCost,
				discountedCost,
				discountPercentage,
				showActualCost: actualCost > discountedCost,
				discountedCostFormatted: formatCurrency( discountedCost, currency ?? 'USD' ),
				actualCostFormatted: formatCurrency( actualCost, currency ?? 'USD' ),
				isFree: productPrice === 0,
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
				isFree: productPrice === 0,
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
				isFree: actualCost === 0,
			};
		}

		const getAmount = ( amount?: string ) => {
			if ( ! amount ) {
				return 0;
			}
			return parseFloat( amount.replace( ',', '' ) ) || 0;
		};

		const bundle = product?.supported_bundles?.find( ( bundle ) => bundle.quantity === quantity );

		const productBundleCost = bundle ? getAmount( bundle.amount ) : getAmount( product.amount );
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
				const monthlyProductBundleCost = getAmount( product.amount ) * quantity;
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
			isFree: discountInfo.actualCost === 0,
		};
	};

	return { getProductPricingInfo, termPricingPriceInfo };
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

		const isTermPricingEnabled =
			isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' );

		const totalCostFormattedText = ( cost: number ) => {
			return isTermPricingEnabled && termPricing === 'yearly'
				? translate( '%(total)s/yr', {
						args: { total: formatCurrency( cost, currency ?? 'USD' ) },
				  } )
				: translate( '%(total)s/mo', {
						args: { total: formatCurrency( cost, currency ?? 'USD' ) },
				  } );
		};

		return {
			...totalInvoiceValue,
			totalDiscountedCostFormatted: formatCurrency(
				totalInvoiceValue.discountedCost,
				currency ?? 'USD'
			),
			totalActualCostFormatted: formatCurrency( totalInvoiceValue.actualCost, currency ?? 'USD' ),
			totalDiscountedCostFormattedText: totalCostFormattedText( totalInvoiceValue.discountedCost ),
			totalActualCostFormattedText: totalCostFormattedText( totalInvoiceValue.actualCost ),
		};
	};

	return { getTotalInvoiceValue };
};
