/**
 * External dependencies
 */
import '@automattic/calypso-polyfills';

/**
 * Internal dependencies
 */
import { RequestCart } from '../types';

export async function mockSetCartEndpoint(
	_: string,
	requestCart: RequestCart
): Promise< object > {
	const {
		products: requestProducts,
		currency: requestCurrency,
		coupon: requestCoupon,
		locale: requestLocale,
	}: RequestCart = requestCart;
	const products = requestProducts.map( convertRequestProductToResponseProduct( requestCurrency ) );

	const taxInteger = products.reduce( ( accum, current ) => {
		return accum + current.item_tax;
	}, 0 );

	const totalInteger = products.reduce( ( accum, current ) => {
		return accum + current.item_subtotal_integer;
	}, taxInteger );

	return {
		products,
		locale: requestLocale,
		currency: requestCurrency,
		credits_integer: 0,
		credits_display: '0',
		allowed_payment_methods: [
			'WPCOM_Billing_Stripe_Payment_Method',
			'WPCOM_Billing_Ebanx',
			'WPCOM_Billing_Web_Payment',
		],
		total_tax_display: 'R$7',
		total_tax_integer: taxInteger,
		total_cost_display: 'R$156',
		total_cost_integer: totalInteger,
		sub_total_display: 'R$149',
		sub_total_integer: totalInteger - taxInteger,
		coupon: requestCoupon,
		is_coupon_applied: true,
		coupon_discounts_integer: [],
		tax: {},
	};
}

function convertRequestProductToResponseProduct( currency ) {
	return product => {
		const { product_id } = product;

		switch ( product_id ) {
			case 1009: // WPCOM Personal Bundle
				return {
					product_id: 1009,
					product_name: 'WordPress.com Personal',
					product_slug: 'personal-bundle',
					currency: currency,
					is_domain_registration: false,
					item_subtotal_integer: 14400,
					item_subtotal_display: 'R$144',
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
			case 5:
				return {
					product_id: 5,
					product_name: 'Domain Mapping',
					product_slug: 'domain_map',
					currency: currency,
					is_domain_registration: false,
					item_subtotal_integer: 0,
					item_subtotal_display: 'R$0',
					item_tax: 0,
					meta: product.meta,
					volume: 1,
					extra: {},
				};
		}

		return {
			product_id: product_id,
			product_name: 'UNKNOWN',
			product_slug: 'unknown',
			currency: currency,
			is_domain_registration: false,
			item_subtotal_integer: 0,
			item_subtotal_display: '$0',
			item_tax: 0,
		};
	};
}

export function mockGetCartEndpointWith( initialCart: object ): ( string ) => Promise< object > {
	return async () => {
		return initialCart;
	};
}
