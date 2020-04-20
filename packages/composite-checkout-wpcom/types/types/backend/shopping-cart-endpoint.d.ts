/**
 * There are three different concepts of "cart" relevant to the shopping cart endpoint:
 *
 *     1. The response format of the cart endpoint (GET)
 *     2. The response format of the cart endpoint (POST)
 *     3. The request format required by the cart endpoint (POST)
 *
 * In practice the response formats of GET and POST request are not exactly the same,
 * but we define here an object type with properties common to both which is sufficient
 * for checkout.
 *
 * The POST endpoint has its own ad-hot request format for the cart. We make this explicit
 * and define a function for converting the response cart into a request cart.
 *
 * @see WPCOM_JSON_API_Me_Shopping_Cart_Endpoint
 */
/**
 * Request schema for the shopping cart endpoint
 */
export interface RequestCart {
	products: RequestCartProduct[];
	tax: null | {
		location: {
			country_code: string;
			postal_code: string;
			subdivision_code: string;
		};
	};
	coupon: string;
	currency: string;
	locale: string;
	is_coupon_applied: boolean;
	temporary: false;
	extra: string;
}
/**
 * Product item schema for the shopping cart endpoint (request)
 */
export interface RequestCartProduct {
	product_slug: string;
	product_id: number;
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
	credits_integer: number;
	credits_display: string;
	allowed_payment_methods: string[];
	coupon: string;
	is_coupon_applied: boolean;
	locale: string;
	messages?: {
		errors: ResponseCartError[];
	};
}
export interface ResponseCartError {
	code: string;
	message: string;
}
export declare const emptyResponseCart: ResponseCart;
/**
 * Product item schema for the shopping cart endpoint (response)
 */
export interface ResponseCartProduct {
	product_name: string;
	product_slug: string;
	product_id: number;
	currency: string;
	item_subtotal_integer: number;
	item_subtotal_display: string;
	is_domain_registration: boolean;
	meta: string;
	volume: number;
	extra: object;
}
export declare const prepareRequestCartProduct: ( ResponseCartProduct: any ) => RequestCartProduct;
export declare const prepareRequestCart: ( ResponseCart: any ) => RequestCart;
