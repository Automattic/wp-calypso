/**
 * External dependencies
 */
import { WPCOMCartItem } from '@automattic/composite-checkout-wpcom';

/**
 * Internal dependencies
 */
import {
	WPCOMTransactionEndpointCart,
	WPCOMTransactionEndpointDomainDetails,
	createTransactionEndpointCartFromLineItems,
} from './transaction-endpoint';

export type PayPalExpressEndpoint = (
	PayPalExpressEndpointRequestPayload
) => Promise< PayPalExpressResponse >;

export type PayPalExpressEndpointRequestPayload = {
	successUrl: string;
	cancelUrl: string;
	cart: WPCOMTransactionEndpointCart;
	domainDetails: WPCOMTransactionEndpointDomainDetails;
	country: string;
	postalCode: string;
};

export function createPayPalExpressEndpointRequestPayloadFromLineItems( {
	debug,
	successUrl,
	cancelUrl,
	siteId,
	couponId,
	country,
	postalCode,
	subdivisionCode,
	domainDetails,
	items,
}: {
	debug: ( string, any ) => void;
	successUrl: string;
	cancelUrl: string;
	siteId: string;
	couponId: string;
	country: string;
	postalCode: string;
	subdivisionCode: string;
	domainDetails: WPCOMTransactionEndpointDomainDetails;
	items: WPCOMCartItem[];
} ): PayPalExpressEndpointRequestPayload {
	return {
		successUrl,
		cancelUrl,
		cart: createTransactionEndpointCartFromLineItems( {
			debug,
			siteId,
			couponId,
			country,
			postalCode,
			subdivisionCode,
			items: items.filter( item => item.type !== 'tax' ),
		} ),
		country,
		postalCode,
		domainDetails,
	};
}

export type PayPalExpressResponse = {};
