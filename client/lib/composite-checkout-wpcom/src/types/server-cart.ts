/**
 * Cart object as returned by the WPCOM cart endpoint.
 * Rather- just enough of it to get what we need for checkout.
 */
export interface ServerCart {
	products: ServerCartItem[];
	total_tax_integer: number;
	total_tax_display: string;
	total_cost_integer: number;
	total_cost_display: string;
	currency: string;
	allowed_payment_methods: string[];
}

/**
 * Cart item object as returned by the backend
 */
export interface ServerCartItem {
	product_name: string;
	product_slug: string;
	currency: string;
	item_subtotal_integer: number;
	item_subtotal_display: string;
	is_domain_registration: boolean;
	meta: string;
}
