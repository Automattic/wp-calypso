/**
 * Internal dependencies
 */
import type { ResponseCart } from './shopping-cart-endpoint';

export function getEmptyResponseCart(): ResponseCart {
	return {
		blog_id: '',
		create_new_blog: false,
		cart_generated_at_timestamp: 0,
		cart_key: '',
		products: [],
		total_tax_integer: 0,
		total_tax_display: '0',
		total_cost: 0,
		total_cost_integer: 0,
		total_cost_display: '0',
		coupon_savings_total_integer: 0,
		coupon_savings_total_display: '0',
		savings_total_integer: 0,
		savings_total_display: '0',
		sub_total_with_taxes_integer: 0,
		sub_total_with_taxes_display: '0',
		sub_total_integer: 0,
		sub_total_display: '0',
		currency: 'USD',
		credits_integer: 0,
		credits_display: '0',
		allowed_payment_methods: [],
		coupon: '',
		is_coupon_applied: false,
		coupon_discounts_integer: [],
		locale: 'en-us',
		tax: { location: {}, display_taxes: false },
		is_signup: false,
	};
}
