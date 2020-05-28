/**
 * External dependencies
 */
import { getNonProductWPCOMCartItemTypes } from 'my-sites/checkout/composite-checkout/wpcom';
import { WPCOMCartItem } from 'my-sites/checkout/composite-checkout/wpcom/types';

/**
 * Internal dependencies
 */
import {
	WPCOMTransactionEndpointCart,
	WPCOMTransactionEndpointDomainDetails,
	createTransactionEndpointCartFromLineItems,
} from './transaction-endpoint';
import { NewSiteParams } from '../wpcom/types/checkout-cart';

export type PayPalExpressEndpoint = (
	_: PayPalExpressEndpointRequestPayload
) => Promise< PayPalExpressEndpointResponse >;

export type PayPalExpressEndpointRequestPayload = {
	successUrl: string;
	cancelUrl: string;
	cart: WPCOMTransactionEndpointCart;
	domainDetails: WPCOMTransactionEndpointDomainDetails;
	country: string;
	postalCode: string;
};

export function createPayPalExpressEndpointRequestPayloadFromLineItems( {
	createNewSiteData,
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
	domainDetails: WPCOMTransactionEndpointDomainDetails;
	items: WPCOMCartItem[];
	createNewSiteData?: NewSiteParams;
} ): PayPalExpressEndpointRequestPayload {
	return {
		successUrl,
		cancelUrl,
		cart: createTransactionEndpointCartFromLineItems( {
			siteId,
			couponId,
			country,
			postalCode,
			subdivisionCode,
			createNewSiteData,
			items: items.filter( ( item ) => ! getNonProductWPCOMCartItemTypes().includes( item.type ) ),
		} ),
		country,
		postalCode,
		domainDetails,
	};
}

export type PayPalExpressEndpointResponse = {};
