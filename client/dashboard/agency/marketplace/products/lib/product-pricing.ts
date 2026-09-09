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

const getAmount = ( amount?: string ) =>
	amount ? parseFloat( amount.replace( ',', '' ) ) || 0 : 0;

export const isFreeProduct = ( product: AgencyProduct ) =>
	! product.monthly_price && ! product.yearly_price && ! getAmount( product.amount );

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

// Mirrors the classic dashboard's term pricing: the selected term's price, or
// the other term's price converted when the product isn't sold on this term.
export function getProductPriceInfo(
	product: AgencyProduct,
	term: TermPricing,
	{ applyIntroductoryPrice = true }: { applyIntroductoryPrice?: boolean } = {}
): ProductPriceInfo {
	const billingTerm = getProductBillingTerm( product, term );
	const isFree = isFreeProduct( product );

	let regularPrice = term === 'yearly' ? product.yearly_price ?? 0 : product.monthly_price ?? 0;
	let intervalLabel: string = term === 'yearly' ? __( 'per year' ) : __( 'per month' );
	let introductoryPrice =
		term === 'yearly' ? product.yearly_introductory_price : product.monthly_introductory_price;

	if ( billingTerm !== term ) {
		if ( billingTerm === 'yearly' ) {
			regularPrice = ( product.yearly_price ?? 0 ) / 12;
			introductoryPrice = product.yearly_introductory_price;
			intervalLabel = __( 'per month, billed yearly' );
		} else {
			regularPrice = ( product.monthly_price ?? 0 ) * 12;
			introductoryPrice = product.monthly_introductory_price;
			intervalLabel = __( 'per year, billed monthly' );
		}
		if ( introductoryPrice != null ) {
			introductoryPrice =
				billingTerm === 'yearly' ? introductoryPrice / 12 : introductoryPrice * 12;
		}
	}

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

export const getTermSuffix = ( term: TermPricing, short = true ) => {
	if ( term === 'yearly' ) {
		return short ? __( '/yr' ) : __( '/year' );
	}
	return short ? __( '/mo' ) : __( '/month' );
};
