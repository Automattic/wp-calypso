/**
 * Internal dependencies
 */
import {
	ResponseCart,
	ResponseCartProduct,
	WPCOMCart,
	WPCOMCartItem,
	WPCOMCartCouponItem,
	CheckoutCartItem,
	readWPCOMPaymentMethodClass,
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
} from '../types';

/**
 * Translate a cart object as returned by the WPCOM cart endpoint to
 * the format required by the composite checkout component.
 *
 * @param translate Localization function
 * @param serverCart Cart object returned by the WPCOM cart endpoint
 * @returns Cart object suitable for passing to the checkout component
 */
export function translateWpcomCartToCheckoutCart(
	translate: ( string, any? ) => string,
	serverCart: ResponseCart
): WPCOMCart {
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
		coupon_discounts_integer,
		is_coupon_applied,
		tax,
	} = serverCart;

	const taxLineItem: CheckoutCartItem = {
		id: 'tax-line-item',
		label: translate( 'Tax' ),
		type: 'tax', // TODO: does this need to be localized, e.g. tax-us?
		amount: {
			currency: currency,
			value: total_tax_integer,
			displayValue: total_tax_display,
		},
	};

	// TODO: watch out for minimal currency units while localizing this
	const couponValueRaw = products
		.map( product => coupon_discounts_integer[ product.product_id ] )
		.filter( Boolean )
		.reduce( ( accum, current ) => accum + current, 0 );
	const couponValue = Math.round( couponValueRaw );
	const couponDisplayValue = `-$${ couponValueRaw / 100 }`;

	const couponLineItem: WPCOMCartCouponItem = {
		id: 'coupon-line-item',
		label: translate( 'Coupon: %s', { args: coupon } ),
		type: 'coupon',
		amount: {
			currency: currency,
			value: couponValue,
			displayValue: couponDisplayValue,
		},
		wpcom_meta: {
			couponCode: coupon,
		},
	};

	const totalItem: CheckoutCartItem = {
		id: 'total',
		type: 'total',
		label: translate( 'Total' ),
		amount: {
			currency: currency,
			value: total_cost_integer,
			displayValue: total_cost_display,
		},
	};

	const subtotalItem: CheckoutCartItem = {
		id: 'subtotal',
		type: 'subtotal',
		label: translate( 'Subtotal' ),
		amount: {
			currency: currency,
			value: sub_total_integer,
			displayValue: sub_total_display,
		},
	};

	// TODO: inject a real currency localization function
	function localizeCurrency( currencyCode: string, amount: number ): string {
		switch ( currencyCode ) {
			case 'BRL':
				return 'R$' + amount / 100;
			default:
				return '$' + amount / 100;
		}
	}

	return {
		items: products.map(
			translateWpcomCartItemToCheckoutCartItem(
				is_coupon_applied,
				coupon_discounts_integer,
				localizeCurrency
			)
		),
		tax: tax.display_taxes ? taxLineItem : null,
		coupon: is_coupon_applied ? couponLineItem : null,
		total: totalItem,
		subtotal: subtotalItem,
		credits: {
			id: 'credits',
			type: 'credits',
			label: translate( 'Credits' ),
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
	coupon_discounts_integer: number[],
	localizeCurrency: ( string, number ) => string
): ( ResponseCartProduct ) => WPCOMCartItem {
	return ( serverCartItem: ResponseCartProduct ) => {
		const {
			product_id,
			product_name,
			product_slug,
			currency,
			item_subtotal_integer,
			is_domain_registration,
			is_bundled,
			meta,
			extra,
			volume,
			uuid,
			product_cost_integer,
			product_cost_display,
		} = serverCartItem;

		// Sublabel is the domain name for registrations
		const sublabel = meta;

		// TODO: watch out for this when localizing
		const value = is_coupon_applied
			? item_subtotal_integer + ( coupon_discounts_integer[ product_id ] ?? 0 )
			: item_subtotal_integer;
		const displayValue = localizeCurrency( currency, value );

		return {
			id: uuid,
			label: product_name,
			sublabel: sublabel,
			type: product_slug,
			amount: {
				currency,
				value,
				displayValue,
			},
			wpcom_meta: {
				uuid: uuid,
				meta: typeof meta === 'string' ? meta : undefined,
				product_id,
				product_slug,
				extra,
				volume,
				is_domain_registration,
				is_bundled,
				product_cost_integer,
				product_cost_display,
			},
		};
	};
}

export function getNonProductWPCOMCartItemTypes(): string[] {
	return [ 'tax', 'coupon', 'total', 'subtotal', 'credits' ];
}
