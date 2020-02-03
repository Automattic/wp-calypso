/**
 * Internal dependencies
 */
import {
	ResponseCart,
	ResponseCartProduct,
	WPCOMCart,
	WPCOMCartItem,
	CheckoutCartItem,
	readWPCOMPaymentMethodClass,
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
} from '../types';

/**
 * Translate a cart object as returned by the WPCOM cart endpoint to
 * the format required by the composite checkout component.
 *
 * @param serverCart Cart object returned by the WPCOM cart endpoint
 * @returns Cart object suitable for passing to the checkout component
 */
export function translateWpcomCartToCheckoutCart( serverCart: ResponseCart ): WPCOMCart {
	const {
		products,
		total_tax_integer,
		total_tax_display,
		total_cost_integer,
		total_cost_display,
		currency,
		credits_integer,
		credits_display,
		allowed_payment_methods,
		sub_total_integer,
		sub_total_display,
		coupon,
		coupon_discounts_int,
		is_coupon_applied,
	} = serverCart;

	const taxLineItem: CheckoutCartItem = {
		id: 'tax-line-item',
		label: 'Tax',
		type: 'tax', // TODO: does this need to be localized, e.g. tax-us?
		amount: {
			currency: currency,
			value: total_tax_integer,
			displayValue: total_tax_display,
		},
	};

	// TODO: watch out for minimal currency units while localizing this
	const couponValueRaw = products
		.map( product => coupon_discounts_int[ product.product_id ] )
		.filter( Boolean )
		.reduce( ( accum, current ) => accum + current, 0 );
	const couponValue = Math.round( couponValueRaw );
	const couponDisplayValue = `-$${ couponValueRaw / 100 }`;

	const couponLineItem: CheckoutCartItem = {
		id: 'coupon-line-item',
		label: `Coupon: ${ coupon }`,
		type: 'coupon',
		amount: {
			currency: currency,
			value: couponValue,
			displayValue: couponDisplayValue,
		},
	};

    const totalItem: CheckoutCartItem = {
        id: 'total',
        type: 'total',
		label: 'Total',
		amount: {
			currency: currency,
			value: total_cost_integer,
			displayValue: total_cost_display,
		},
	};

	const subtotalItem: CheckoutCartItem = {
		id: 'subtotal',
		type: 'subtotal',
		label: 'Subtotal',
		amount: {
			currency: currency,
			value: sub_total_integer,
			displayValue: sub_total_display,
		},
	};

	// TODO: inject a real currency localization function
	function localizeCurrency( currencyCode: string, amount: number ): string {
		switch ( currencyCode ) {
			case 'USD':
				return '$' + amount / 100;
			case 'BRL':
				return 'R$' + amount / 100;
		}

		throw new Error( 'Currency not supported: ' + currency );
	}

	return {
		items: products.map(
			translateWpcomCartItemToCheckoutCartItem(
				is_coupon_applied,
				coupon_discounts_int,
				localizeCurrency
			)
		),
		tax: taxLineItem,
		coupon: is_coupon_applied ? couponLineItem : null,
		total: totalItem,
		subtotal: subtotalItem,
		credits: {
			id: 'credits',
			type: 'credits',
			label: 'Credits',
			amount: { value: credits_integer, displayValue: credits_display, currency },
		},
		allowedPaymentMethods: allowed_payment_methods
			.filter( slug => {
				return slug !== 'WPCOM_Billing_MoneyPress_Paygate';
			} ) // TODO: stop returning this from the server
			.map( readWPCOMPaymentMethodClass )
			.map( translateWpcomPaymentMethodToCheckoutPaymentMethod )
			.filter( Boolean ),
		couponCode: coupon,
	};
}

// Convert a backend cart item to a checkout cart item
function translateWpcomCartItemToCheckoutCartItem(
	is_coupon_applied: boolean,
	coupon_discounts_int: number[],
	localizeCurrency: ( string, number ) => string
): ( ResponseCartProduct, number ) => WPCOMCartItem {
	return ( serverCartItem: ResponseCartProduct, index: number ) => {
		const {
			product_id,
			product_name,
			product_slug,
			currency,
			item_subtotal_integer,
			is_domain_registration,
			meta,
			extra,
			volume,
		} = serverCartItem;

		// Sublabel is the domain name for registrations
		const sublabel = is_domain_registration ? meta : undefined;

		// TODO: watch out for this when localizing
		const value = is_coupon_applied
			? item_subtotal_integer + ( coupon_discounts_int[ product_id ] ?? 0 )
			: item_subtotal_integer;
		const displayValue = localizeCurrency( currency, value );

		return {
			id: String( index ),
			label: product_name,
			sublabel: sublabel,
			type: product_slug,
			amount: {
				currency,
				value,
				displayValue,
			},
			wpcom_meta: {
				uuid: String( index ),
				meta: typeof meta === 'string' ? meta : undefined,
				product_id,
				extra,
				volume,
			},
		};
	};
}
