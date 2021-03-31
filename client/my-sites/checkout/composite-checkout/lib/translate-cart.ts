/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { getTotalLineItemFromCart } from '@automattic/wpcom-checkout';
import type {
	ResponseCart,
	ResponseCartProduct,
	RequestCartProduct,
} from '@automattic/shopping-cart';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { WPCOMCart, WPCOMCartItem } from '../types/checkout-cart';
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
} from 'calypso/lib/products-values';
import { isRenewal } from 'calypso/lib/cart-values/cart-items';
import doesValueExist from './does-value-exist';
import type { DomainContactDetails } from '../types/backend/domain-contact-details-components';
import type {
	WPCOMTransactionEndpointCart,
	WPCOMTransactionEndpointRequestPayload,
	TransactionRequestWithLineItems,
	TransactionRequest,
} from '../types/transaction-endpoint';
import { isGSuiteOrGoogleWorkspaceProductSlug } from 'calypso/lib/gsuite';

const debug = debugFactory( 'calypso:composite-checkout:translate-cart' );

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
		items: products.map( translateReponseCartProductToWPCOMCartItem ),
		total: totalItem,
		allowedPaymentMethods,
	};
}

// Convert a backend cart item to a checkout cart item
function translateReponseCartProductToWPCOMCartItem(
	serverCartItem: ResponseCartProduct
): WPCOMCartItem {
	const {
		product_id,
		product_slug,
		currency,
		item_original_cost_display,
		item_original_cost_integer,
		item_subtotal_monthly_cost_display,
		item_subtotal_monthly_cost_integer,
		item_original_subtotal_display,
		item_original_subtotal_integer,
		related_monthly_plan_cost_display,
		related_monthly_plan_cost_integer,
		is_sale_coupon_applied,
		months_per_bill_period,
		item_subtotal_display,
		item_subtotal_integer,
		is_domain_registration,
		is_bundled,
		meta,
		extra,
		volume,
		quantity,
		uuid,
		product_cost_integer,
		product_cost_display,
	} = serverCartItem;

	const label = getLabel( serverCartItem );

	const type = isPlan( serverCartItem ) ? 'plan' : product_slug;

	// for displaying crossed-out original price
	const itemOriginalCostDisplay = item_original_cost_display || '';
	const itemOriginalSubtotalDisplay = item_original_subtotal_display || '';
	const itemSubtotalMonthlyCostDisplay = item_subtotal_monthly_cost_display || '';

	return {
		id: uuid,
		label,
		type,
		amount: {
			currency: currency || '',
			value: item_subtotal_integer || 0,
			displayValue: item_subtotal_display || '',
		},
		wpcom_response_cart_product: serverCartItem,
		wpcom_meta: {
			uuid: uuid,
			meta,
			product_id,
			product_slug,
			extra,
			volume,
			quantity,
			is_domain_registration: is_domain_registration || false,
			is_bundled: is_bundled || false,
			item_original_cost_display: itemOriginalCostDisplay,
			item_original_cost_integer: item_original_cost_integer || 0,
			item_subtotal_monthly_cost_display: itemSubtotalMonthlyCostDisplay,
			item_subtotal_monthly_cost_integer: item_subtotal_monthly_cost_integer || 0,
			item_original_subtotal_display: itemOriginalSubtotalDisplay,
			item_original_subtotal_integer: item_original_subtotal_integer || 0,
			is_sale_coupon_applied: is_sale_coupon_applied || false,
			months_per_bill_period,
			product_cost_integer: product_cost_integer || 0,
			product_cost_display: product_cost_display || '',
			related_monthly_plan_cost_integer: related_monthly_plan_cost_integer || 0,
			related_monthly_plan_cost_display: related_monthly_plan_cost_display || '',
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

// Create cart object as required by the WPCOM transactions endpoint
// '/me/transactions/': WPCOM_JSON_API_Transactions_Endpoint
export function createTransactionEndpointCartFromLineItems( {
	siteId,
	couponId,
	country,
	postalCode,
	subdivisionCode,
	items,
	contactDetails,
}: {
	siteId: string | undefined;
	couponId?: string;
	country: string;
	postalCode: string;
	subdivisionCode?: string;
	items: WPCOMCartItem[];
	contactDetails: DomainContactDetails | null;
} ): WPCOMTransactionEndpointCart {
	debug( 'creating cart from items', items );

	const currency: string = items.reduce(
		( firstValue: string, item ) => firstValue || item.amount.currency,
		''
	);

	return {
		blog_id: siteId || '0',
		cart_key: siteId || 'no-site',
		create_new_blog: siteId ? false : true,
		coupon: couponId || '',
		currency: currency || '',
		temporary: false,
		extra: [],
		products: items
			.map( ( item ) => addRegistrationDataToGSuiteItem( item, contactDetails ) )
			.map( createTransactionEndpointCartItemFromLineItem ),
		tax: {
			location: {
				country_code: country,
				postal_code: postalCode,
				subdivision_code: subdivisionCode,
			},
		},
	};
}

function createTransactionEndpointCartItemFromLineItem( item: WPCOMCartItem ): RequestCartProduct {
	return {
		product_slug: item.wpcom_meta?.product_slug,
		product_id: item.wpcom_meta?.product_id,
		meta: item.wpcom_meta?.meta ?? '',
		volume: item.wpcom_meta?.volume ?? 1,
		quantity: item.wpcom_meta?.quantity ?? null,
		extra: item.wpcom_meta?.extra,
	};
}

function addRegistrationDataToGSuiteItem(
	item: WPCOMCartItem,
	contactDetails: DomainContactDetails | null
): WPCOMCartItem {
	if (
		! isGSuiteOrGoogleWorkspaceProductSlug( item.wpcom_meta?.product_slug ) ||
		isGoogleWorkspaceExtraLicence( item.wpcom_meta )
	) {
		return item;
	}

	return {
		...item,
		wpcom_meta: {
			...item.wpcom_meta,
			extra: {
				...item.wpcom_meta.extra,
				google_apps_registration_data: contactDetails || undefined,
			},
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

export function createTransactionEndpointRequestPayloadFromLineItems(
	args: TransactionRequestWithLineItems
): WPCOMTransactionEndpointRequestPayload {
	return createTransactionEndpointRequestPayload( {
		...args,
		cart: createTransactionEndpointCartFromLineItems( {
			siteId: args.siteId,
			couponId: args.couponId,
			country: args.country,
			postalCode: args.postalCode,
			subdivisionCode: args.subdivisionCode,
			items: args.items,
			contactDetails: args.domainDetails || {},
		} ),
	} );
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
