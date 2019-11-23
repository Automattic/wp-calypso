/**
 * There are three different concepts of "cart" relevant to the shopping cart endpoint:
 *
 *     1. The request format required by the cart endpoint (SET)
 *     2. The response format of the cart endpoint (SET)
 *     3. The response format of the cart endpoint (GET)
 *
 * In this file we try to nail these down as types. For simplicity's sake we will
 * combine the response format for GET and SET into one type.
 *
 *
 *
 * @see https://opengrok.a8c.com/source/xref/trunk/public.api/rest/wpcom-json-endpoints/class.wpcom-json-api-me-shopping-cart-endpoints.php
 */

/**
 * Request schema for the shopping cart endpoint
 */
export interface RequestCart {
	products: RequestCartProduct[];
	tax: any[]; // TODO: fix this
	coupon: string;
	currency: string;
	locale: string;
	is_coupon_applied: boolean;
	temporary: false;
	extra: any[]; // TODO: fix this
}

/**
 * Product item schema for the shopping cart endpoint (request)
 */
export interface RequestCartProduct {
	product_slug: string;
	meta: string;
}

/**
 * Response schema for the shopping cart endpoint
 */
export interface ResponseCart {
	products: ResponseCartProduct[];
	total_tax_integer: number;
	total_tax_display: string;
	total_cost_integer: number;
	total_cost_display: string;
	currency: string;
	allowed_payment_methods: string[];
	coupon: string;
	is_coupon_applied: boolean;
	locale: string;
}

/**
 * Product item schema for the shopping cart endpoint (response)
 */
export interface ResponseCartProduct {
	product_name: string;
	product_slug: string;
	currency: string;
	item_subtotal_integer: number;
	item_subtotal_display: string;
	is_domain_registration: boolean;
	meta: string;
}

export const prepareRequestCart: ( ResponseCart ) => RequestCart = ( {
	products,
	currency,
	locale,
	coupon,
}: ResponseCart ) => {
	return <RequestCart>{
		products: products.map( prepareRequestCartProduct ),
		currency: currency,
		locale: locale,
		coupon: coupon,
		temporary: false,
		// tax: any[]; // TODO: fix this
		// is_coupon_applied: boolean;
		// extra: any[]; // TODO: fix this
	};
};

export const prepareRequestCartProduct: ( ResponseCartProduct ) => RequestCartProduct = ( {
	product_slug,
	meta,
}: ResponseCartProduct ) => {
	return <RequestCartProduct>{
		product_slug: product_slug,
		meta: meta,
	};
};
