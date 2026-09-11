import { __ } from '@wordpress/i18n';
import type { TermPricing } from '../../use-term-pricing';
import type { AgencyProduct } from '@automattic/api-core';

export interface ProductPriceInfo {
	/** What the agency pays per term, after any introductory discount. */
	price: number;
	/** The regular per-term price, when an introductory discount applies. */
	regularPrice?: number;
	discountPercentage: number;
	/** "per year", "per month, billed yearly", ... */
	intervalLabel: string;
	/** Which term the product is actually billed on. */
	billingTerm: TermPricing;
	isFree: boolean;
}

export const isFreeProduct = ( product: AgencyProduct ) =>
	! product.monthly_price && ! product.yearly_price;

export const calculateDiscountPercentage = ( regularPrice: number, discountedPrice: number ) =>
	regularPrice <= 0 ? 0 : Math.round( ( ( regularPrice - discountedPrice ) / regularPrice ) * 100 );

// A product that lacks a product id for the selected term is billed on the other one.
export function getProductBillingTerm( product: AgencyProduct, term: TermPricing ): TermPricing {
	if ( term === 'monthly' && ! product.monthly_product_id ) {
		return 'yearly';
	}
	if ( term === 'yearly' && ! product.yearly_product_id ) {
		return 'monthly';
	}
	return term;
}

export function getTermAvailabilityNote(
	product: AgencyProduct,
	term: TermPricing
): string | undefined {
	if ( isFreeProduct( product ) ) {
		return undefined;
	}
	const billingTerm = getProductBillingTerm( product, term );
	if ( billingTerm === term ) {
		return undefined;
	}
	return billingTerm === 'yearly'
		? __( 'This product is not available for monthly billing. We will bill you yearly instead.' )
		: __( 'This product is not available for yearly billing. We will bill you monthly instead.' );
}

// Mirrors the classic dashboard's term pricing: the selected term's price with
// its introductory discount, or the other term's regular price converted when
// the product isn't sold on this term.
export function getProductPriceInfo(
	product: AgencyProduct,
	term: TermPricing,
	{ applyIntroductoryPrice = true }: { applyIntroductoryPrice?: boolean } = {}
): ProductPriceInfo {
	const billingTerm = getProductBillingTerm( product, term );
	const isFree = isFreeProduct( product );

	if ( billingTerm !== term ) {
		return billingTerm === 'yearly'
			? {
					price: ( product.yearly_price ?? 0 ) / 12,
					discountPercentage: 0,
					intervalLabel: __( 'per month, billed yearly' ),
					billingTerm,
					isFree,
			  }
			: {
					price: ( product.monthly_price ?? 0 ) * 12,
					discountPercentage: 0,
					intervalLabel: __( 'per year, billed monthly' ),
					billingTerm,
					isFree,
			  };
	}

	const regularPrice = term === 'yearly' ? product.yearly_price ?? 0 : product.monthly_price ?? 0;
	const intervalLabel = term === 'yearly' ? __( 'per year' ) : __( 'per month' );
	const introductoryPrice =
		term === 'yearly' ? product.yearly_introductory_price : product.monthly_introductory_price;

	if ( applyIntroductoryPrice && introductoryPrice != null && introductoryPrice < regularPrice ) {
		return {
			price: introductoryPrice,
			regularPrice,
			discountPercentage: calculateDiscountPercentage( regularPrice, introductoryPrice ),
			intervalLabel,
			billingTerm,
			isFree,
		};
	}

	return { price: regularPrice, discountPercentage: 0, intervalLabel, billingTerm, isFree };
}

export interface WpcomTieredPrice {
	/** The regular per-site price for the term. */
	basePricePerUnit: number;
	/** The per-site price at the reached volume tier. */
	pricePerUnit: number;
	/** Regular price for the new sites only. */
	actualCost: number;
	/** Tiered price for the new sites only. */
	discountedCost: number;
	discountPercentage: number;
}

// Mirrors the classic dashboard: sites the agency already owns count towards
// the volume tier, but only the new sites are charged.
export function getWpcomTieredPrice(
	product: AgencyProduct,
	quantity: number,
	term: TermPricing,
	ownedSites = 0
): WpcomTieredPrice {
	const basePricePerUnit =
		term === 'yearly' ? product.yearly_price ?? 0 : product.monthly_price ?? 0;
	const tierPrices = term === 'yearly' ? product.tier_yearly_prices : product.tier_monthly_prices;
	const tierQuantity = quantity + ownedSites;
	const tier =
		tierPrices?.find( ( candidate ) => candidate.units === tierQuantity ) ??
		tierPrices
			?.filter( ( candidate ) => candidate.units <= tierQuantity )
			.sort( ( a, b ) => b.units - a.units )[ 0 ];
	const pricePerUnit = tier?.price ?? basePricePerUnit;

	return {
		basePricePerUnit,
		pricePerUnit,
		actualCost: basePricePerUnit * quantity,
		discountedCost: pricePerUnit * quantity,
		discountPercentage: calculateDiscountPercentage( basePricePerUnit, pricePerUnit ),
	};
}

export const getTermSuffix = ( term: TermPricing, short = true ) => {
	if ( term === 'yearly' ) {
		return short ? __( '/yr' ) : __( '/year' );
	}
	return short ? __( '/mo' ) : __( '/month' );
};
