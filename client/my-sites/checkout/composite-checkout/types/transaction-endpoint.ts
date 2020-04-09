/**
 * External dependencies
 */
import {
	WPCOMCartItem,
	getNonProductWPCOMCartItemTypes,
} from 'my-sites/checkout/composite-checkout/wpcom';
import debugFactory from 'debug';

const debug = debugFactory( 'calypso:transaction-endpoint' );

export type WPCOMTransactionEndpoint = (
	_: WPCOMTransactionEndpointRequestPayload
) => Promise< WPCOMTransactionEndpointResponse >;

// Request payload as expected by the WPCOM transactions endpoint
// '/me/transactions/': WPCOM_JSON_API_Transactions_Endpoint
export type WPCOMTransactionEndpointRequestPayload = {
	cart: WPCOMTransactionEndpointCart;
	payment: WPCOMTransactionEndpointPaymentDetails;
	domainDetails?: WPCOMTransactionEndpointDomainDetails;
};

export type WPCOMTransactionEndpointPaymentDetails = {
	paymentMethod: string;
	paymentKey: string;
	paymentPartner: string;
	storedDetailsId: string;
	name: string;
	zip: string;
	postalCode: string;
	country: string;
};

export type WPCOMTransactionEndpointCart = {
	blog_id: string;
	cart_key: string;
	create_new_blog: boolean;
	coupon: string;
	currency: string;
	temporary: false;
	extra: string[];
	products: {
		product_id: number;
		meta?: string;
		currency: string;
		volume: number;
		extra?: object;
	}[];
	tax: {
		location: {
			country_code: string;
			postal_code?: string;
			subdivision_code?: string;
		};
	};
};

export type WPCOMTransactionEndpointDomainDetails = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address_1: string;
	city: string;
	state: string;
	countryCode: string;
	postalCode: string;
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
}: {
	siteId: string;
	couponId?: string;
	country: string;
	postalCode: string;
	subdivisionCode?: string;
	items: WPCOMCartItem[];
} ): WPCOMTransactionEndpointCart {
	debug( 'creating cart from items', items );

	const currency: string = items.reduce(
		( firstValue: string, item ) => firstValue || item.amount.currency,
		''
	);

	const convertItem = ( item: WPCOMCartItem ) => {
		return {
			product_id: item.wpcom_meta?.product_id,
			meta: item.wpcom_meta?.meta,
			currency: item.amount.currency,
			volume: item.wpcom_meta?.volume ?? 1,
			extra: item.wpcom_meta?.extra,
		};
	};

	return {
		blog_id: siteId || '0',
		cart_key: siteId || 'no-site',
		create_new_blog: siteId ? false : true,
		coupon: couponId || '',
		currency: currency || '',
		temporary: false,
		extra: [],
		products: items
			.filter( product => ! getNonProductWPCOMCartItemTypes().includes( product.type ) )
			.map( convertItem ),
		tax: {
			location: {
				country_code: country,
				postal_code: postalCode,
				subdivision_code: subdivisionCode,
			},
		},
	};
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
}: {
	siteId: string;
	couponId?: string;
	country: string;
	postalCode: string;
	subdivisionCode?: string;
	domainDetails?: WPCOMTransactionEndpointDomainDetails;
	items: WPCOMCartItem[];
	paymentMethodType: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
	storedDetailsId: string;
	name: string;
} ): WPCOMTransactionEndpointRequestPayload {
	return {
		cart: createTransactionEndpointCartFromLineItems( {
			siteId,
			couponId: couponId || getCouponIdFromProducts( items ),
			country,
			postalCode,
			subdivisionCode,
			items: items.filter( item => item.type !== 'tax' ),
		} ),
		domainDetails,
		payment: {
			paymentMethod: paymentMethodType,
			paymentKey: paymentMethodToken,
			paymentPartner: paymentPartnerProcessorId,
			storedDetailsId,
			name,
			country,
			postalCode,
			zip: postalCode, // TODO: do we need this in addition to postalCode?
		},
	};
}

function getCouponIdFromProducts( items: WPCOMCartItem[] ): string | undefined {
	const couponItem = items.find( item => item.type === 'coupon' );
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
