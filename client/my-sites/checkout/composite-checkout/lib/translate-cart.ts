import {
	isGoogleWorkspaceExtraLicence,
	isGSuiteOrGoogleWorkspaceProductSlug,
} from '@automattic/calypso-products';
import { isValueTruthy, getTotalLineItemFromCart } from '@automattic/wpcom-checkout';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import {
	readWPCOMPaymentMethodClass,
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
} from './translate-payment-method-names';
import type {
	ResponseCart,
	ResponseCartProduct,
	ResponseCartTaxData,
	DomainContactDetails,
	RequestCart,
	RequestCartTaxData,
	CartKey,
} from '@automattic/shopping-cart';
import type {
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
	const { allowed_payment_methods } = serverCart;

	const totalItem = getTotalLineItemFromCart( serverCart );

	const alwaysEnabledPaymentMethods = [ 'free-purchase' ];

	const allowedPaymentMethods = [ ...allowed_payment_methods, ...alwaysEnabledPaymentMethods ]
		.map( readWPCOMPaymentMethodClass )
		.filter( isValueTruthy )
		.map( translateWpcomPaymentMethodToCheckoutPaymentMethod );

	return {
		total: totalItem,
		allowedPaymentMethods,
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
} ): RequestCart {
	if ( responseCart.products.some( ( product ) => product.extra.isJetpackCheckout ) ) {
		const isUserLess = responseCart.cart_key === 'no-user';
		const isSiteLess = responseCart.blog_id === 0;

		// At this point, cart_key will be 'no-user' | blog_id | 'no-site', in that order.
		const cartKey = isUserLess ? responseCart.cart_key : responseCart.blog_id || 'no-site';

		// A cart with the 'no-user' key, in the context of a Jetpack checkout flow, means that
		// a WP.com account will be created before submitting the transaction (see submitWpcomTransaction).
		// Once the WP.com account is created, the cart key is replaced with the blog ID and sent to the
		// /transactions endpoint. If there is no blog ID, a temporary blog is created on the backend side.
		return {
			blog_id: responseCart.blog_id.toString(),
			cart_key: cartKey as CartKey,
			create_new_blog: isSiteLess,
			coupon: responseCart.coupon || '',
			temporary: false,
			products: responseCart.products.map( ( item ) =>
				addRegistrationDataToGSuiteCartProduct( item, contactDetails )
			),
			tax: createTransactionEndpointTaxFromResponseCartTax( responseCart.tax ),
		};
	}

	return {
		blog_id: siteId || '0',
		cart_key: ( siteId || 'no-site' ) as CartKey,
		create_new_blog: siteId ? false : true,
		coupon: responseCart.coupon || '',
		temporary: false,
		products: responseCart.products.map( ( item ) =>
			addRegistrationDataToGSuiteCartProduct( item, contactDetails )
		),
		tax: createTransactionEndpointTaxFromResponseCartTax( responseCart.tax ),
	};
}

function createTransactionEndpointTaxFromResponseCartTax(
	tax: ResponseCartTaxData
): RequestCartTaxData {
	const { country_code, postal_code, subdivision_code, vat_id, organization } = tax.location;
	return {
		location: {
			country_code,
			postal_code,
			subdivision_code,
			vat_id,
			organization,
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
	pan,
	gstin,
	nik,
	useForAllSubscriptions,
	eventSource,
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
			pan,
			gstin,
			nik,
			useForAllSubscriptions,
			eventSource,
		},
		tos: getToSAcceptancePayload(),
	};
}
