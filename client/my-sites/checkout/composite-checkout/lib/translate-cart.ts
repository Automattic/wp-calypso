import { isEnabled } from '@automattic/calypso-config';
import {
	isPlan,
	isGoogleWorkspaceExtraLicence,
	isGSuiteOrGoogleWorkspaceProductSlug,
} from '@automattic/calypso-products';
import {
	getTotalLineItemFromCart,
	tryToGuessPostalCodeFormat,
	isValueTruthy,
	getLabel,
} from '@automattic/wpcom-checkout';
import {
	readWPCOMPaymentMethodClass,
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
} from './translate-payment-method-names';
import type { LineItem } from '@automattic/composite-checkout';
import type {
	ResponseCart,
	ResponseCartProduct,
	ResponseCartTaxData,
	DomainContactDetails,
} from '@automattic/shopping-cart';
import type {
	WPCOMTransactionEndpointCart,
	WPCOMTransactionEndpointRequestPayload,
	TransactionRequest,
	WPCOMCart,
} from '@automattic/wpcom-checkout';

/**
 * Translate a cart object as returned by the WPCOM cart endpoint to
 * the format required by the composite checkout component.
 *
 * @param serverCart Cart object returned by the WPCOM cart endpoint
 * @returns Cart object suitable for passing to the checkout component
 */
export function translateResponseCartToWPCOMCart( serverCart: ResponseCart ): WPCOMCart {
	const { products, allowed_payment_methods } = serverCart;

	const totalItem = getTotalLineItemFromCart( serverCart );

	const alwaysEnabledPaymentMethods = [ 'full-credits', 'free-purchase' ];

	const allowedPaymentMethods = [ ...allowed_payment_methods, ...alwaysEnabledPaymentMethods ]
		.map( readWPCOMPaymentMethodClass )
		.filter( isValueTruthy )
		.map( translateWpcomPaymentMethodToCheckoutPaymentMethod );

	return {
		items: products.map( translateReponseCartProductToLineItem ),
		total: totalItem,
		allowedPaymentMethods,
	};
}

// Convert a backend cart item to a checkout cart item
function translateReponseCartProductToLineItem( serverCartItem: ResponseCartProduct ): LineItem {
	const {
		product_slug,
		currency,
		item_subtotal_display,
		item_subtotal_integer,
		uuid,
	} = serverCartItem;

	const label = getLabel( serverCartItem );

	const type = isPlan( serverCartItem ) ? 'plan' : product_slug;

	return {
		id: uuid,
		label,
		type,
		amount: {
			currency: currency || '',
			value: item_subtotal_integer || 0,
			displayValue: item_subtotal_display || '',
		},
	};
}

// Create cart object as required by the WPCOM transactions endpoint
// '/me/transactions/': WPCOM_JSON_API_Transactions_Endpoint
export function createTransactionEndpointCartFromResponseCart( {
	siteId,
	contactDetails,
	responseCart,
}: {
	siteId: string | undefined;
	contactDetails: DomainContactDetails | null;
	responseCart: ResponseCart;
} ): WPCOMTransactionEndpointCart {
	if ( responseCart.products.some( ( product ) => product.extra.isJetpackCheckout ) ) {
		const isUserLess = responseCart.cart_key === 'no-user';
		const isSiteLess = responseCart.blog_id === 0;

		// At this point, cart_key will be 'no-user' | blog_id | 'no-site', in that order.
		const cartKey = isUserLess ? responseCart.cart_key : responseCart.blog_id || 'no-site';
		const isSiteLessJetpackCheckout = isEnabled( 'jetpack/siteless-checkout' ) && isSiteLess;

		// A cart with the 'no-user' key, in the context of a Jetpack checkout flow, means that
		// a WP.com account will be created before submitting the transaction (see submitWpcomTransaction).
		// Once the WP.com account is created, the cart key is replaced with the blog ID and sent to the
		// /transactions endpoint. If there is no blog ID, a temporary blog is created on the backend side.
		return {
			blog_id: responseCart.blog_id.toString(),
			cart_key: cartKey.toString(),
			create_new_blog: isSiteLessJetpackCheckout,
			is_jetpack_checkout: true,
			coupon: responseCart.coupon || '',
			currency: responseCart.currency,
			temporary: false,
			extra: [],
			products: responseCart.products.map( ( item ) =>
				addRegistrationDataToGSuiteCartProduct( item, contactDetails )
			),
			tax: createTransactionEndpointTaxFromResponseCartTax( responseCart.tax ),
		};
	}

	return {
		blog_id: siteId || '0',
		cart_key: siteId || 'no-site',
		create_new_blog: siteId ? false : true,
		is_jetpack_checkout: false,
		coupon: responseCart.coupon || '',
		currency: responseCart.currency,
		temporary: false,
		extra: [],
		products: responseCart.products.map( ( item ) =>
			addRegistrationDataToGSuiteCartProduct( item, contactDetails )
		),
		tax: createTransactionEndpointTaxFromResponseCartTax( responseCart.tax ),
	};
}

function createTransactionEndpointTaxFromResponseCartTax(
	tax: ResponseCartTaxData
): Omit< ResponseCartTaxData, 'display_taxes' > {
	const { country_code, postal_code } = tax.location;
	const formattedPostalCode = postal_code
		? tryToGuessPostalCodeFormat( postal_code.toUpperCase(), country_code )
		: undefined;
	return {
		location: {
			...( country_code ? { country_code } : {} ),
			...( formattedPostalCode ? { postal_code: formattedPostalCode } : {} ),
		},
	};
}

function addRegistrationDataToGSuiteCartProduct(
	item: ResponseCartProduct,
	contactDetails: DomainContactDetails | null
): ResponseCartProduct {
	if (
		! isGSuiteOrGoogleWorkspaceProductSlug( item.product_slug ) ||
		isGoogleWorkspaceExtraLicence( item )
	) {
		return item;
	}
	return {
		...item,
		extra: {
			...item.extra,
			google_apps_registration_data: contactDetails || undefined,
		},
	};
}

export function createTransactionEndpointRequestPayload( {
	cart,
	country,
	state,
	postalCode,
	city,
	address,
	streetNumber,
	phoneNumber,
	document,
	deviceId,
	domainDetails,
	paymentMethodType,
	paymentMethodToken,
	paymentPartnerProcessorId,
	storedDetailsId,
	name,
	email,
	cancelUrl,
	successUrl,
	idealBank,
	tefBank,
	pan,
	gstin,
	nik,
	useForAllSubscriptions,
}: TransactionRequest ): WPCOMTransactionEndpointRequestPayload {
	return {
		cart,
		domainDetails,
		payment: {
			paymentMethod: paymentMethodType,
			paymentKey: paymentMethodToken,
			paymentPartner: paymentPartnerProcessorId,
			storedDetailsId,
			name,
			email,
			country,
			countryCode: country,
			state,
			postalCode,
			zip: postalCode, // TODO: do we need this in addition to postalCode?
			city,
			address,
			streetNumber,
			phoneNumber,
			document,
			deviceId,
			successUrl,
			cancelUrl,
			idealBank,
			tefBank,
			pan,
			gstin,
			nik,
			useForAllSubscriptions,
		},
	};
}
