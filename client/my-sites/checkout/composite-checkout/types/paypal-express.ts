/**
 * External dependencies
 */
import { getNonProductWPCOMCartItemTypes } from 'my-sites/checkout/composite-checkout/wpcom';
import type {
	WPCOMCartItem,
	DomainContactDetails,
} from 'my-sites/checkout/composite-checkout/wpcom/types';

/**
 * Internal dependencies
 */
import {
	WPCOMTransactionEndpointCart,
	createTransactionEndpointCartFromLineItems,
} from './transaction-endpoint';

export type PayPalExpressEndpoint = (
	_: PayPalExpressEndpointRequestPayload
) => Promise< PayPalExpressEndpointResponse >;

export type PayPalExpressEndpointRequestPayload = {
	successUrl: string;
	cancelUrl: string;
	cart: WPCOMTransactionEndpointCart;
	domainDetails: DomainContactDetails;
	country: string;
	postalCode: string;
	isWhiteGloveOffer: boolean;
};

export function createPayPalExpressEndpointRequestPayloadFromLineItems( {
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
	successUrl: string;
	cancelUrl: string;
	siteId: string;
	couponId: string;
	country: string;
	postalCode: string;
	subdivisionCode: string;
	domainDetails: DomainContactDetails;
	items: WPCOMCartItem[];
} ): PayPalExpressEndpointRequestPayload {
	const urlParams = new URLSearchParams( window.location.search );
	const isWhiteGlove = urlParams.get( 'type' ) === 'white-glove';

	return {
		successUrl,
		cancelUrl,
		cart: createTransactionEndpointCartFromLineItems( {
			siteId,
			couponId,
			country,
			postalCode,
			subdivisionCode,
			items: items.filter( ( item ) => ! getNonProductWPCOMCartItemTypes().includes( item.type ) ),
			contactDetails: domainDetails,
		} ),
		country,
		postalCode,
		domainDetails,
		isWhiteGloveOffer: isWhiteGlove,
	};
}

export type PayPalExpressEndpointResponse = {};
