/**
 * External dependencies
 */
import type { ResponseCartProductExtra } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import type { WPCOMCartItem } from './checkout-cart';
import type { Purchase } from './wpcom-store-state';
import type { DomainContactDetails } from './backend/domain-contact-details-components';

// The data required by createTransactionEndpointRequestPayloadFromLineItems
export interface TransactionRequestWithLineItems {
	country: string;
	postalCode: string;
	items: WPCOMCartItem[];
	paymentMethodType: string;
	name: string;
	siteId?: string | undefined;
	couponId?: string | undefined;
	state?: string | undefined;
	subdivisionCode?: string | undefined;
	city?: string | undefined;
	address?: string | undefined;
	streetNumber?: string | undefined;
	phoneNumber?: string | undefined;
	document?: string | undefined;
	deviceId?: string | undefined;
	domainDetails?: DomainContactDetails | undefined;
	paymentMethodToken?: string | undefined;
	paymentPartnerProcessorId?: string | undefined;
	storedDetailsId?: string | undefined;
	email?: string | undefined;
	successUrl?: string | undefined;
	cancelUrl?: string | undefined;
	idealBank?: string | undefined;
	tefBank?: string | undefined;
	pan?: string | undefined;
	gstin?: string | undefined;
	nik?: string | undefined;
}

export type ExistingCardTransactionRequestWithLineItems = Partial< TransactionRequestWithLineItems > &
	Required<
		Pick<
			TransactionRequestWithLineItems,
			| 'country'
			| 'postalCode'
			| 'items'
			| 'name'
			| 'storedDetailsId'
			| 'siteId'
			| 'paymentMethodToken'
			| 'paymentPartnerProcessorId'
		>
	>;

export type WPCOMTransactionEndpoint = (
	_: WPCOMTransactionEndpointRequestPayload
) => Promise< WPCOMTransactionEndpointResponse >;

// Request payload as expected by the WPCOM transactions endpoint
// '/me/transactions/': WPCOM_JSON_API_Transactions_Endpoint
export type WPCOMTransactionEndpointRequestPayload = {
	cart: WPCOMTransactionEndpointCart;
	payment: WPCOMTransactionEndpointPaymentDetails;
	domainDetails?: DomainContactDetails;
};

export type WPCOMTransactionEndpointPaymentDetails = {
	paymentMethod: string;
	paymentKey?: string;
	paymentPartner?: string;
	storedDetailsId?: string;
	name: string;
	email?: string;
	zip: string;
	postalCode: string;
	country: string;
	countryCode: string;
	state?: string;
	city?: string;
	address?: string;
	streetNumber?: string;
	phoneNumber?: string;
	document?: string;
	deviceId?: string;
	successUrl?: string;
	cancelUrl?: string;
	idealBank?: string;
	tefBank?: string;
	pan?: string;
	gstin?: string;
	nik?: string;
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

export type WPCOMTransactionEndpointCartItem = {
	product_id: number;
	meta?: string;
	currency: string;
	volume: number;
	extra?: ResponseCartProductExtra;
};

export type WPCOMTransactionEndpointResponse = {
	success: boolean;
	error_code: string;
	error_message: string;
	receipt_id: number;
	purchases: Record< number, Purchase >;
};
