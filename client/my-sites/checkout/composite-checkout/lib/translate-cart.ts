/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';
import type { LineItem } from '@automattic/composite-checkout';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	WPCOMCart,
	WPCOMCartItem,
	WPCOMCartCouponItem,
	WPCOMCartCreditsItem,
} from '../types/checkout-cart';
import {
	readWPCOMPaymentMethodClass,
	translateWpcomPaymentMethodToCheckoutPaymentMethod,
} from './translate-payment-method-names';
import {
	isPlan,
	isDomainTransferProduct,
	isDomainProduct,
	isDotComPlan,
	isGSuiteOrGoogleWorkspace,
	isTitanMail,
} from 'calypso/lib/products-values';
import { isRenewal } from 'calypso/lib/cart-values/cart-items';
import doesValueExist from './does-value-exist';
import doesPurchaseHaveFullCredits from './does-purchase-have-full-credits';
import type { DomainContactDetails } from '../types/backend/domain-contact-details-components';
import type {
	WPCOMTransactionEndpointCart,
	WPCOMTransactionEndpointCartItem,
	WPCOMTransactionEndpointRequestPayload,
	TransactionRequestWithLineItems,
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
	const {
		products,
		coupon_savings_total_integer,
		savings_total_display,
		savings_total_integer,
		currency,
		allowed_payment_methods,
		coupon,
	} = serverCart;

	const taxLineItem = getTaxLineItem( serverCart );

	const couponLineItem = getCouponLineItem( serverCart );

	const creditsLineItem = getCreditsLineItem( serverCart );

	const savingsLineItem: LineItem = {
		id: 'savings-line-item',
		label: String( translate( 'Total savings' ) ),
		type: 'savings',
		amount: {
			currency: currency,
			value: savings_total_integer,
			displayValue: savings_total_display,
		},
	};

	const totalItem = getTotalLineItem( serverCart );

	const subtotalItem = getSubtotalLineItem( serverCart );

	const alwaysEnabledPaymentMethods = [ 'full-credits', 'free-purchase' ];

	const allowedPaymentMethods = [ ...allowed_payment_methods, ...alwaysEnabledPaymentMethods ]
		.map( readWPCOMPaymentMethodClass )
		.filter( doesValueExist )
		.map( translateWpcomPaymentMethodToCheckoutPaymentMethod );

	return {
		items: products.map( translateReponseCartProductToWPCOMCartItem ),
		tax: taxLineItem,
		coupon: coupon && coupon_savings_total_integer ? couponLineItem : null,
		total: totalItem,
		savings: savings_total_integer > 0 ? savingsLineItem : null,
		subtotal: subtotalItem,
		credits: creditsLineItem,
		allowedPaymentMethods,
		couponCode: coupon,
	};
}

export function getCouponLineItem( responseCart: ResponseCart ): WPCOMCartCouponItem | null {
	if ( ! responseCart.coupon || ! responseCart.coupon_savings_total_integer ) {
		return null;
	}
	return {
		id: 'coupon-line-item',
		label: String(
			translate( 'Coupon: %(couponCode)s', { args: { couponCode: responseCart.coupon } } )
		),
		type: 'coupon',
		amount: {
			currency: responseCart.currency,
			value: responseCart.coupon_savings_total_integer,
			displayValue: String(
				translate( '- %(discountAmount)s', {
					args: { discountAmount: responseCart.coupon_savings_total_display },
				} )
			),
		},
		wpcom_meta: {
			couponCode: responseCart.coupon,
		},
	};
}

export function getSubtotalLineItem( responseCart: ResponseCart ): LineItem {
	return {
		id: 'subtotal',
		type: 'subtotal',
		label: String( translate( 'Subtotal' ) ),
		amount: {
			currency: responseCart.currency,
			value: responseCart.sub_total_integer,
			displayValue: responseCart.sub_total_display,
		},
	};
}

export function getTotalLineItem( responseCart: ResponseCart ): LineItem {
	return {
		id: 'total',
		type: 'total',
		label: String( translate( 'Total' ) ),
		amount: {
			currency: responseCart.currency,
			value: responseCart.total_cost_integer,
			displayValue: responseCart.total_cost_display,
		},
	};
}

export function getTaxLineItem( responseCart: ResponseCart ): LineItem | null {
	if ( ! responseCart.tax.display_taxes ) {
		return null;
	}
	return {
		id: 'tax-line-item',
		label: String( translate( 'Tax' ) ),
		type: 'tax',
		amount: {
			currency: responseCart.currency,
			value: responseCart.total_tax_integer,
			displayValue: responseCart.total_tax_display,
		},
	};
}

export function getCreditsLineItem( responseCart: ResponseCart ): WPCOMCartCreditsItem | null {
	if ( responseCart.credits_integer <= 0 ) {
		return null;
	}
	return {
		id: 'credits',
		label: String( translate( 'Credits' ) ),
		type: 'credits',
		amount: {
			currency: responseCart.currency,
			value: responseCart.credits_integer,
			displayValue: String(
				translate( '- %(discountAmount)s', {
					args: {
						// Clamp the credits display value to the total
						discountAmount: doesPurchaseHaveFullCredits( responseCart )
							? responseCart.sub_total_with_taxes_display
							: responseCart.credits_display,
					},
				} )
			),
		},
		wpcom_meta: {
			credits_integer: responseCart.credits_integer,
			credits_display: responseCart.credits_display,
		},
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

export function getNonProductWPCOMCartItemTypes(): string[] {
	return [ 'tax', 'coupon', 'total', 'subtotal', 'credits', 'savings' ];
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
			.filter( ( product ) => ! getNonProductWPCOMCartItemTypes().includes( product.type ) )
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

function createTransactionEndpointCartItemFromLineItem(
	item: WPCOMCartItem
): WPCOMTransactionEndpointCartItem {
	return {
		product_id: item.wpcom_meta?.product_id,
		meta: item.wpcom_meta?.meta,
		currency: item.amount.currency,
		volume: item.wpcom_meta?.volume ?? 1,
		quantity: item.wpcom_meta?.quantity ?? null,
		extra: item.wpcom_meta?.extra,
	} as WPCOMTransactionEndpointCartItem;
}

function addRegistrationDataToGSuiteItem(
	item: WPCOMCartItem,
	contactDetails: DomainContactDetails | null
): WPCOMCartItem {
	if ( ! isGSuiteOrGoogleWorkspaceProductSlug( item.wpcom_meta?.product_slug ) ) {
		return item;
	}
	return {
		...item,
		wpcom_meta: {
			...item.wpcom_meta,
			extra: { ...item.wpcom_meta.extra, google_apps_registration_data: contactDetails },
		},
	} as WPCOMCartItem;
}

export function createTransactionEndpointRequestPayloadFromLineItems( {
	siteId,
	couponId,
	country,
	state,
	postalCode,
	subdivisionCode,
	city,
	address,
	streetNumber,
	phoneNumber,
	document,
	deviceId,
	domainDetails,
	items,
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
}: TransactionRequestWithLineItems ): WPCOMTransactionEndpointRequestPayload {
	return {
		cart: createTransactionEndpointCartFromLineItems( {
			siteId,
			couponId: couponId || getCouponIdFromProducts( items ),
			country,
			postalCode,
			subdivisionCode,
			items: items.filter( ( item ) => item.type !== 'tax' ),
			contactDetails: domainDetails || {},
		} ),
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

function getCouponIdFromProducts( items: WPCOMCartItem[] ): string | undefined {
	const couponItem = items.find( ( item ) => item.type === 'coupon' );
	return couponItem?.wpcom_meta?.couponCode;
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

	return isRenewalItem ? translate( 'Renewal' ) : '';
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
