/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { getTotalLineItemFromCart } from '@automattic/wpcom-checkout';
import type { LineItem } from '@automattic/composite-checkout';
import type {
	ResponseCart,
	ResponseCartProduct,
	DomainContactDetails,
} from '@automattic/shopping-cart';
import type {
	WPCOMTransactionEndpointCart,
	WPCOMTransactionEndpointRequestPayload,
	TransactionRequest,
	WPCOMCart,
} from '@automattic/wpcom-checkout';

/**
 * Internal dependencies
 */
import {
	readWPCOMPaymentMethodClass,
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
} from './translate-payment-method-names';
import {
	isPlan,
	isDomainTransferProduct,
	isDomainProduct,
	isDotComPlan,
	isGoogleWorkspaceExtraLicence,
	isGSuiteOrGoogleWorkspace,
	isTitanMail,
} from '@automattic/calypso-products';
import { isRenewal } from 'calypso/lib/cart-values/cart-items';
import doesValueExist from './does-value-exist';
import { isGSuiteOrGoogleWorkspaceProductSlug } from 'calypso/lib/gsuite';

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
		.filter( doesValueExist )
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
	return {
		blog_id: siteId || '0',
		cart_key: siteId || 'no-site',
		create_new_blog: siteId ? false : true,
		coupon: responseCart.coupon || '',
		currency: responseCart.currency,
		temporary: false,
		extra: [],
		products: responseCart.products.map( ( item ) =>
			addRegistrationDataToGSuiteCartProduct( item, contactDetails )
		),
		tax: responseCart.tax,
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
		},
	};
}

export function getSublabel( serverCartItem: ResponseCartProduct ): i18nCalypso.TranslateResult {
	const isRenewalItem = isRenewal( serverCartItem );
	const { meta, product_name: productName } = serverCartItem;

	if ( isDotComPlan( serverCartItem ) || ( ! isRenewalItem && isTitanMail( serverCartItem ) ) ) {
		if ( isRenewalItem ) {
			return translate( 'Plan Renewal' );
		}
	}

	if ( isPlan( serverCartItem ) ) {
		return isRenewalItem ? translate( 'Plan Renewal' ) : translate( 'Plan Subscription' );
	}

	if ( isGSuiteOrGoogleWorkspace( serverCartItem ) ) {
		if ( isRenewalItem ) {
			return translate( 'Productivity and Collaboration Tools Renewal' );
		}

		return translate( 'Productivity and Collaboration Tools' );
	}

	if (
		meta &&
		( isDomainProduct( serverCartItem ) || isDomainTransferProduct( serverCartItem ) )
	) {
		if ( ! isRenewalItem ) {
			return productName || '';
		}

		if ( productName ) {
			return translate( '%(productName)s Renewal', { args: { productName } } );
		}
	}

	if ( ! isRenewalItem && serverCartItem.months_per_bill_period === 1 ) {
		return translate( 'Billed monthly' );
	}

	if ( isRenewalItem ) {
		return translate( 'Renewal' );
	}

	return '';
}

export function getLabel( serverCartItem: ResponseCartProduct ): string {
	if (
		serverCartItem.meta &&
		( isDomainProduct( serverCartItem ) || isDomainTransferProduct( serverCartItem ) )
	) {
		return serverCartItem.meta;
	}
	return serverCartItem.product_name || '';
}
