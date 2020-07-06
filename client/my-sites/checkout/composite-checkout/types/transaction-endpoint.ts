/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { getNonProductWPCOMCartItemTypes } from 'my-sites/checkout/composite-checkout/wpcom';
import type {
	WPCOMCartItem,
	DomainContactDetails,
} from 'my-sites/checkout/composite-checkout/wpcom/types';
import type { CartItemExtra } from 'lib/cart-values/types';
import { isGSuiteProductSlug } from 'lib/gsuite';

const debug = debugFactory( 'calypso:transaction-endpoint' );

export type WPCOMTransactionEndpoint = (
	_: WPCOMTransactionEndpointRequestPayload
) => Promise< WPCOMTransactionEndpointResponse >;

// Request payload as expected by the WPCOM transactions endpoint
// '/me/transactions/': WPCOM_JSON_API_Transactions_Endpoint
export type WPCOMTransactionEndpointRequestPayload = {
	cart: WPCOMTransactionEndpointCart;
	payment: WPCOMTransactionEndpointPaymentDetails;
	domainDetails?: DomainContactDetails;
	isWhiteGloveOffer: boolean;
};

export type WPCOMTransactionEndpointPaymentDetails = {
	paymentMethod: string;
	paymentKey?: string;
	paymentPartner: string;
	storedDetailsId?: string;
	name: string;
	email?: string;
	zip: string;
	postalCode: string;
	country: string;
	successUrl?: string;
	cancelUrl?: string;
	idealBank?: string;
};

export type WPCOMTransactionEndpointCart = {
	blog_id: string;
	cart_key: string;
	create_new_blog: boolean;
	coupon: string;
	currency: string;
	temporary: false;
	extra: string[];
	products: WPCOMTransactionEndpointCartItem[];
	tax: {
		location: {
			country_code: string;
			postal_code?: string;
			subdivision_code?: string;
		};
	};
};

type WPCOMTransactionEndpointCartItem = {
	product_id: number;
	meta?: string;
	currency: string;
	volume: number;
	extra?: CartItemExtra;
};

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
	siteId: string;
	couponId?: string;
	country: string;
	postalCode: string;
	subdivisionCode?: string;
	items: WPCOMCartItem[];
	contactDetails: DomainContactDetails;
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
		extra: item.wpcom_meta?.extra,
	} as WPCOMTransactionEndpointCartItem;
}

function addRegistrationDataToGSuiteItem(
	item: WPCOMCartItem,
	contactDetails: DomainContactDetails
): WPCOMCartItem {
	if ( ! isGSuiteProductSlug( item.wpcom_meta?.product_slug ) ) {
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
	postalCode,
	subdivisionCode,
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
}: {
	siteId: string;
	couponId?: string;
	country: string;
	postalCode: string;
	subdivisionCode?: string;
	domainDetails?: DomainContactDetails;
	items: WPCOMCartItem[];
	paymentMethodType: string;
	paymentMethodToken?: string;
	paymentPartnerProcessorId: string;
	storedDetailsId?: string;
	name: string;
	email?: string;
	successUrl?: string;
	cancelUrl?: string;
	idealBank?: string;
} ): WPCOMTransactionEndpointRequestPayload {
	const urlParams = new URLSearchParams( window.location.search );
	const isWhiteGlove = urlParams.get( 'type' ) === 'white-glove';

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
			postalCode,
			zip: postalCode, // TODO: do we need this in addition to postalCode?
			successUrl,
			cancelUrl,
			idealBank,
		},
		isWhiteGloveOffer: isWhiteGlove,
	};
}

function getCouponIdFromProducts( items: WPCOMCartItem[] ): string | undefined {
	const couponItem = items.find( ( item ) => item.type === 'coupon' );
	return couponItem?.wpcom_meta?.couponCode;
}

export type WPCOMTransactionEndpointResponse = {
	success: boolean;
	error_code: string;
	error_message: string;
	receipt_id: number;
	purchases: {
		product_id: number;
		product_name: string;
		product_name_short: string;
		product_slug: string;
		free_trial: false;
		is_domain_registration: boolean;
		is_email_verified: boolean;
		registrar_support_url?: string;
		meta?: string;
	}[];
};
