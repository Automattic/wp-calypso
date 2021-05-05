/**
 * Internal dependencies
 */
import type { ResponseCart, ResponseCartProduct } from './shopping-cart-endpoint';

export function getEmptyResponseCart(): ResponseCart {
	return {
		blog_id: '',
		create_new_blog: false,
		cart_generated_at_timestamp: 0,
		cart_key: '',
		products: [],
		total_tax: '0',
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
		next_domain_is_free: false,
	};
}

export function getEmptyResponseCartProduct(): ResponseCartProduct {
	return {
		time_added_to_cart: Date.now(),
		product_name: 'Replace me',
		product_slug: 'replace-me',
		currency: 'USD',
		extra: {},
		meta: '',
		product_id: 1,
		volume: 1,
		quantity: null,
		current_quantity: null,
		item_original_cost_integer: 0,
		item_original_cost_display: '$0',
		item_subtotal_integer: 0,
		item_subtotal_display: '$0',
		product_cost_integer: 0,
		product_cost_display: '$0',
		item_subtotal_monthly_cost_display: '$0',
		item_subtotal_monthly_cost_integer: 0,
		item_original_subtotal_integer: 0,
		item_original_subtotal_display: '$0',
		is_domain_registration: false,
		is_bundled: false,
		is_sale_coupon_applied: false,
		months_per_bill_period: null,
		uuid: 'product001',
		cost: 0,
		price: 0,
		product_type: 'test',
		included_domain_purchase_amount: 0,
	};
}
