import debugFactory from 'debug';
import { getEmptyResponseCart } from './empty-carts';
import type {
	TempResponseCart,
	TaxLocationUpdate,
	RequestCart,
	RequestCartProduct,
	ResponseCart,
	ResponseCartProduct,
	GetCart,
	CartKey,
	ResponseCartTaxLocation,
} from './types';

const debug = debugFactory( 'shopping-cart:cart-functions' );
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
	coupon,
	tax,
	blog_id,
}: TempResponseCart ): RequestCart {
	let requestCartTax = null;
	if (
		tax.location.country_code ||
		tax.location.postal_code ||
		tax.location.subdivision_code ||
		tax.location.vat_id ||
		tax.location.organization ||
		tax.location.address ||
		tax.location.city ||
		tax.location.is_for_business
	) {
		requestCartTax = {
			location: {
				country_code: tax.location.country_code,
				postal_code: tax.location.postal_code,
				subdivision_code: tax.location.subdivision_code,
				vat_id: tax.location.vat_id,
				organization: tax.location.organization,
				address: tax.location.address,
				city: tax.location.city,
				is_for_business: tax.location.is_for_business,
			},
		};
	}
	return {
		blog_id,
		products: products.map( convertResponseCartProductToRequestCartProduct ),
		coupon,
		temporary: false,
		tax: requestCartTax,
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

/**
 * Convert the `tax.location` data in a response cart to the data required by
 * the `updateLocation()` cart action.
 */
export function convertTaxLocationToLocationUpdate(
	location: ResponseCartTaxLocation
): TaxLocationUpdate {
	return {
		countryCode: location.country_code || undefined,
		postalCode: location.postal_code || undefined,
		subdivisionCode: location.subdivision_code || undefined,
		vatId: location.vat_id || undefined,
		organization: location.organization || undefined,
		address: location.address || undefined,
		city: location.city || undefined,
		isForBusiness: location.is_for_business || undefined,
	};
}

/**
 * Convert the tax location data used by the `updateLocation()` cart action to
 * the `tax.location` data in the response cart.
 */
export function convertLocationUpdateToTaxLocation(
	location: TaxLocationUpdate
): ResponseCartTaxLocation {
	return {
		country_code: location.countryCode || undefined,
		postal_code: location.postalCode || undefined,
		subdivision_code: location.subdivisionCode || undefined,
		vat_id: location.vatId || undefined,
		organization: location.organization || undefined,
		address: location.address || undefined,
		city: location.city || undefined,
		is_for_business: location.isForBusiness || undefined,
	};
}

export function addLocationToResponseCart(
	cart: TempResponseCart,
	location: TaxLocationUpdate
): TempResponseCart {
	return {
		...cart,
		tax: {
			...cart.tax,
			location: convertLocationUpdateToTaxLocation( location ),
		},
	};
}

export function doesCartLocationDifferFromResponseCartLocation(
	cart: TempResponseCart,
	location: TaxLocationUpdate
): boolean {
	const {
		countryCode: newCountryCode = '',
		postalCode: newPostalCode = '',
		subdivisionCode: newSubdivisionCode = '',
		vatId: newVatId = '',
		organization: newOrganization = '',
		address: newAddress = '',
		city: newCity = '',
		isForBusiness: newIsForBusiness = false,
	} = location;
	const {
		country_code: oldCountryCode = '',
		postal_code: oldPostalCode = '',
		subdivision_code: oldSubdivisionCode = '',
		vat_id: oldVatId = '',
		organization: oldOrganization = '',
		address: oldAddress = '',
		city: oldCity = '',
		is_for_business: oldIsForBusiness = false,
	} = cart.tax?.location ?? {};

	if ( location.countryCode !== undefined && newCountryCode !== oldCountryCode ) {
		return true;
	}
	if ( location.postalCode !== undefined && newPostalCode !== oldPostalCode ) {
		return true;
	}
	if ( location.subdivisionCode !== undefined && newSubdivisionCode !== oldSubdivisionCode ) {
		return true;
	}
	if ( location.vatId !== undefined && newVatId !== oldVatId ) {
		return true;
	}
	if ( location.organization !== undefined && newOrganization !== oldOrganization ) {
		return true;
	}
	if ( location.address !== undefined && newAddress !== oldAddress ) {
		return true;
	}
	if ( location.city !== undefined && newCity !== oldCity ) {
		return true;
	}
	if ( newIsForBusiness !== oldIsForBusiness ) {
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
				uuid: product.cart_item_id,
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

function shouldProductReplaceCart(
	product: RequestCartProduct,
	responseCart: TempResponseCart
): boolean {
	const doesCartHaveRenewals = responseCart.products.some(
		( cartProduct ) => cartProduct.extra?.purchaseType === 'renewal'
	);

	if (
		! doesCartHaveRenewals &&
		product.extra?.purchaseType === 'renewal' &&
		product.product_slug !== 'domain_redemption'
	) {
		// adding a renewal replaces the cart unless it is a privacy protection (comment copied from original code from old checkout; is domain_redemption really privacy protection?)
		return true;
	}

	if ( doesCartHaveRenewals && product.extra?.purchaseType !== 'renewal' ) {
		// all items should replace the cart if the cart contains a renewal
		return true;
	}

	return false;
}

function shouldProductsReplaceCart(
	products: RequestCartProduct[],
	responseCart: TempResponseCart
): boolean {
	return products.some( ( product ) => shouldProductReplaceCart( product, responseCart ) );
}

export function addItemsToResponseCart(
	responseCart: TempResponseCart,
	products: RequestCartProduct[]
): TempResponseCart {
	if ( shouldProductsReplaceCart( products, responseCart ) ) {
		debug( 'items should replace response cart', products );
		return replaceAllItemsInResponseCart( responseCart, products );
	}
	debug( 'items should not replace response cart', products );
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

export async function findCartKeyFromSiteSlug(
	slug: string,
	getCart: GetCart
): Promise< CartKey > {
	try {
		const cart = await getCart( slug as CartKey );
		return cart.cart_key;
	} catch {
		return 'no-site';
	}
}
