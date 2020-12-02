/**
 * Internal dependencies
 */
import { getEmptyResponseCart } from './empty-carts';
import { TempResponseCart } from './shopping-cart-endpoint';
import type {
	CartLocation,
	RequestCart,
	RequestCartProduct,
	ResponseCart,
	ResponseCartProduct,
} from './types';

let lastUUID = 100;
const emptyResponseCart = getEmptyResponseCart();

function convertResponseCartProductToRequestCartProduct(
	product: ResponseCartProduct | RequestCartProduct
): RequestCartProduct {
	const { product_slug, meta, product_id, extra, volume, quantity } = product;
	return {
		product_slug,
		meta,
		volume,
		quantity,
		product_id,
		extra,
	};
}

export function convertResponseCartToRequestCart( {
	products,
	currency,
	locale,
	coupon,
	is_coupon_applied,
	tax,
}: TempResponseCart ): RequestCart {
	let requestCartTax = null;
	if ( tax.location.country_code || tax.location.postal_code || tax.location.subdivision_code ) {
		requestCartTax = {
			location: {
				country_code: tax.location.country_code,
				postal_code: tax.location.postal_code,
				subdivision_code: tax.location.subdivision_code,
			},
		};
	}
	return {
		products: products.map( convertResponseCartProductToRequestCartProduct ),
		currency,
		locale,
		coupon,
		is_coupon_applied,
		temporary: false,
		tax: requestCartTax,
		extra: '', // This property doesn't appear to be used for anything
	};
}

export function convertTempResponseCartToResponseCart( cart: TempResponseCart ): ResponseCart {
	return {
		...cart,
		products: cart.products.filter( isValidResponseCartProduct ),
	};
}

function isValidResponseCartProduct(
	product: RequestCartProduct | ResponseCartProduct
): product is ResponseCartProduct {
	return 'uuid' in product;
}

export function removeItemFromResponseCart(
	cart: TempResponseCart,
	uuidToRemove: string
): TempResponseCart {
	return {
		...cart,
		products: cart.products.filter( ( product ) => {
			return isValidResponseCartProduct( product ) ? product.uuid !== uuidToRemove : true;
		} ),
	};
}

export function addCouponToResponseCart(
	cart: TempResponseCart,
	couponToAdd: string
): TempResponseCart {
	return {
		...cart,
		coupon: couponToAdd,
		is_coupon_applied: false,
	};
}

export function removeCouponFromResponseCart( cart: TempResponseCart ): TempResponseCart {
	return {
		...cart,
		coupon: '',
		is_coupon_applied: false,
	};
}

export function addLocationToResponseCart(
	cart: TempResponseCart,
	location: CartLocation
): TempResponseCart {
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
	};
}

export function doesCartLocationDifferFromResponseCartLocation(
	cart: TempResponseCart,
	location: CartLocation
): boolean {
	const { countryCode, postalCode, subdivisionCode } = location;
	const isMissing = ( value: null | undefined | string ) => value === null || value === undefined;
	if ( ! isMissing( countryCode ) && cart.tax.location.country_code !== countryCode ) {
		return true;
	}
	if ( ! isMissing( postalCode ) && cart.tax.location.postal_code !== postalCode ) {
		return true;
	}
	if ( ! isMissing( subdivisionCode ) && cart.tax.location.subdivision_code !== subdivisionCode ) {
		return true;
	}
	return false;
}

export function convertRawResponseCartToResponseCart(
	rawResponseCart: Partial< ResponseCart >
): ResponseCart {
	if ( typeof rawResponseCart !== 'object' || rawResponseCart === null ) {
		return emptyResponseCart;
	}

	// If tax.location is an empty PHP associative array, it will be JSON serialized to [] but we need {}
	let taxLocation = {};
	if ( rawResponseCart.tax?.location ) {
		if ( Array.isArray( rawResponseCart.tax.location ) ) {
			taxLocation = {};
		} else {
			taxLocation = rawResponseCart.tax.location;
		}
	}

	const rawProducts =
		rawResponseCart.products?.length && Array.isArray( rawResponseCart.products )
			? rawResponseCart.products
			: [];

	return {
		...emptyResponseCart,
		...rawResponseCart,
		tax: {
			location: taxLocation,
			display_taxes: rawResponseCart.tax?.display_taxes ?? false,
		},
		// Add uuid to products returned by the server
		products: rawProducts.filter( isRealProduct ).map( ( product ) => {
			return {
				...product,
				uuid: product.product_slug + lastUUID++,
			};
		} ),
	};
}

function isRealProduct( serverCartItem: ResponseCartProduct ): boolean {
	// Credits are reported separately, so we do not need to include the pseudo-product in the line items.
	if ( serverCartItem.product_slug === 'wordpress-com-credits' ) {
		return false;
	}
	return true;
}

export function addItemsToResponseCart(
	responseCart: TempResponseCart,
	products: RequestCartProduct[]
): TempResponseCart {
	return {
		...responseCart,
		products: [ ...responseCart.products, ...products ],
	};
}

export function replaceAllItemsInResponseCart(
	responseCart: TempResponseCart,
	products: RequestCartProduct[]
): TempResponseCart {
	return {
		...responseCart,
		products: [ ...products ],
	};
}

export function replaceItemInResponseCart(
	cart: TempResponseCart,
	uuidToReplace: string,
	productPropertiesToChange: Partial< RequestCartProduct >
): TempResponseCart {
	return {
		...cart,
		products: cart.products.map( ( item ) => {
			if ( isValidResponseCartProduct( item ) && item.uuid === uuidToReplace ) {
				return { ...item, ...productPropertiesToChange };
			}
			return item;
		} ),
	};
}

export function doesResponseCartContainProductMatching(
	responseCart: TempResponseCart,
	productProperties: Partial< ResponseCartProduct >
): boolean {
	return responseCart.products.some( ( product ) => {
		return (
			isValidResponseCartProduct( product ) &&
			Object.keys( productProperties ).every( ( key ) => {
				const typedKey = key as keyof ResponseCartProduct;
				return product[ typedKey ] === productProperties[ typedKey ];
			} )
		);
	} );
}
