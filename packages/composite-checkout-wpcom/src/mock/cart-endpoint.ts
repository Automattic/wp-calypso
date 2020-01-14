import '@automattic/calypso-polyfills';

/**
 * Internal dependencies
 */
import { RequestCart, ResponseCart } from '../types';

/**
 * A fake WPCOM shopping cart endpoint.
 */
export async function mockSetCartEndpoint( {
	products: requestProducts,
	currency: requestCurrency,
	coupon: requestCoupon,
	locale: requestLocale,
}: RequestCart ): Promise< ResponseCart > {
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
		coupon: requestCoupon,
		is_coupon_applied: true,
	} as ResponseCart;
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
					meta: '',
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

export function mockGetCartEndpointWith(
	initialCart: ResponseCart
): ( string ) => Promise< ResponseCart > {
	return async () => {
		return initialCart;
	};
}
