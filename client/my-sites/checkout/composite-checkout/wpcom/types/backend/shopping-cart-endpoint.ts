/**
 * Internal dependencies
 */
import type { CartItemExtra } from 'lib/cart-values/types';

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

let lastUUID = 100;

/**
 * Request schema for the shopping cart endpoint
 */
export interface RequestCart {
	products: RequestCartProduct[];
	tax: null | {
		location: {
			country_code: string | null;
			postal_code: string | null;
			subdivision_code: string | null;
		};
	};
	coupon: string;
	currency: string;
	locale: string;
	is_coupon_applied: boolean;
	temporary: false;
	extra: string;
	is_update?: boolean;
}

/**
 * Product item schema for the shopping cart endpoint (request)
 */
export interface RequestCartProduct {
	product_slug: string;
	product_id: number;
	meta: string;
	extra: CartItemExtra;
}

/**
 * Response schema for the shopping cart endpoint
 */
export interface ResponseCart {
	products: ( TempResponseCartProduct | ResponseCartProduct )[];
	total_tax_integer: number;
	total_tax_display: string;
	total_cost_integer: number;
	total_cost_display: string;
	savings_total_integer: number;
	savings_total_display: string;
	sub_total_integer: number;
	sub_total_display: string;
	currency: string;
	credits_integer: number;
	credits_display: string;
	allowed_payment_methods: string[];
	coupon: string;
	is_coupon_applied: boolean;
	coupon_discounts_integer: number[];
	locale: string;
	is_signup: boolean;
	messages?: { errors: ResponseCartError[] };
	tax: {
		location: {
			country_code?: string;
			postal_code?: string;
			subdivision_code?: string;
		};
		display_taxes: boolean;
	};
}

export interface ResponseCartError {
	code: string;
	message: string;
}

export const emptyResponseCart = {
	products: [],
	total_tax_integer: 0,
	total_tax_display: '0',
	total_cost_integer: 0,
	total_cost_display: '0',
	savings_total_integer: 0,
	savings_total_display: '0',
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
	tax: { location: [], display_taxes: false },
	is_signup: false,
} as ResponseCart;

/**
 * Product item schema for the shopping cart endpoint (response)
 */
export interface ResponseCartProduct {
	product_name: string;
	product_slug: string;
	product_id: number;
	currency: string;
	product_cost_integer: number;
	product_cost_display: string;
	item_original_cost_integer: number;
	item_original_cost_display: string;
	item_subtotal_integer: number;
	item_subtotal_display: string;
	is_domain_registration: boolean;
	is_bundled: boolean;
	meta: string;
	volume: number;
	extra: object;
	uuid: string;
	cost: number;
	price: number;
	product_type: string;
	included_domain_purchase_amount: number;
}

/**
 * A way to add an item to the response cart with incomplete data while the data is loading.
 */
export interface TempResponseCartProduct {
	product_name: string | null;
	product_slug: string;
	product_id: number;
	currency: string | null;
	product_cost_integer: null;
	product_cost_display: null;
	item_subtotal_integer: null;
	item_subtotal_display: null;
	item_original_cost_display: null;
	item_original_cost_integer: null;
	is_domain_registration: boolean | null;
	is_bundled: boolean | null;
	meta: string;
	volume: number;
	extra: object;
	uuid: string;
	cost: null;
	price: null;
	product_type: null;
	included_domain_purchase_amount: null;
}

export function convertResponseCartProductToRequestCartProduct(
	product: ResponseCartProduct | TempResponseCartProduct
): RequestCartProduct {
	const { product_slug, meta, product_id, extra } = product;
	return {
		product_slug,
		meta,
		product_id,
		extra,
	} as RequestCartProduct;
}

export function convertResponseCartToRequestCart( {
	products,
	currency,
	locale,
	coupon,
	is_coupon_applied,
	tax,
}: ResponseCart ): RequestCart {
	return {
		products: products.map( convertResponseCartProductToRequestCartProduct ),
		currency,
		locale,
		coupon,
		is_coupon_applied,
		temporary: false,
		tax,
		extra: '', // TODO: fix this
	} as RequestCart;
}

export function removeItemFromResponseCart(
	cart: ResponseCart,
	uuidToRemove: string
): ResponseCart {
	return {
		...cart,
		products: cart.products.filter( ( product ) => {
			return product.uuid !== uuidToRemove;
		} ),
	} as ResponseCart;
}

export function addCouponToResponseCart( cart: ResponseCart, couponToAdd: string ): ResponseCart {
	return {
		...cart,
		coupon: couponToAdd,
		is_coupon_applied: false,
	} as ResponseCart;
}

export function removeCouponFromResponseCart( cart: ResponseCart ): ResponseCart {
	return {
		...cart,
		coupon: '',
		is_coupon_applied: false,
	} as ResponseCart;
}

export function addLocationToResponseCart(
	cart: ResponseCart,
	location: CartLocation
): ResponseCart {
	return {
		...cart,
		tax: {
			...cart.tax,
			location: {
				country_code: location.countryCode || undefined,
				postal_code: location.postalCode || undefined,
				subdivision_code: location.subdivisionCode || undefined,
			},
		},
	} as ResponseCart;
}

export function doesCartLocationDifferFromResponseCartLocation(
	cart: ResponseCart,
	location: CartLocation
): boolean {
	const { countryCode, postalCode, subdivisionCode } = location;
	if ( countryCode && cart.tax.location.country_code !== countryCode ) {
		return true;
	}
	if ( postalCode && cart.tax.location.postal_code !== postalCode ) {
		return true;
	}
	if ( subdivisionCode && cart.tax.location.subdivision_code !== subdivisionCode ) {
		return true;
	}
	return false;
}

export interface CartLocation {
	countryCode: string | null;
	postalCode: string | null;
	subdivisionCode: string | null;
}

export function convertRawResponseCartToResponseCart(
	rawResponseCart: ResponseCart
): ResponseCart {
	return {
		...rawResponseCart,
		// If tax.location is an empty PHP associative array, it will be JSON serialized to [] but we need {}
		tax: {
			location: Array.isArray( rawResponseCart.tax.location ) ? {} : rawResponseCart.tax.location,
			display_taxes: rawResponseCart.tax.display_taxes,
		},
		// Add uuid to products returned by the server
		products: rawResponseCart.products.map( ( product, index ) => {
			return {
				...product,
				uuid: index.toString(),
			};
		} ),
	} as ResponseCart;
}

export function addItemToResponseCart(
	responseCart: ResponseCart,
	product: RequestCartProduct
): ResponseCart {
	const convertedProduct = convertRequestCartProductToResponseCartProduct( product );
	return {
		...responseCart,
		products: [ ...responseCart.products, convertedProduct ],
	} as ResponseCart;
}

export function replaceItemInResponseCart(
	cart: ResponseCart,
	uuidToReplace: string,
	newProductId: number,
	newProductSlug: string
): ResponseCart {
	return {
		...cart,
		products: cart.products.map( ( item ) => {
			if ( item.uuid === uuidToReplace ) {
				return { ...item, product_id: newProductId, product_slug: newProductSlug };
			}
			return item;
		} ),
	} as ResponseCart;
}

function convertRequestCartProductToResponseCartProduct(
	product: RequestCartProduct
): TempResponseCartProduct {
	const { product_slug, product_id, meta, extra } = product;
	return {
		product_name: '',
		product_slug,
		product_id,
		currency: null,
		item_original_cost_display: null,
		item_original_cost_integer: null,
		product_cost_integer: null,
		product_cost_display: null,
		item_subtotal_integer: null,
		item_subtotal_display: null,
		is_domain_registration: null,
		is_bundled: null,
		meta,
		volume: 1,
		extra,
		uuid: 'calypso-shopping-cart-endpoint-uuid-' + lastUUID++,
		cost: null,
		price: null,
		product_type: null,
		included_domain_purchase_amount: null,
	};
}
