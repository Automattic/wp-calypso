/**
 * External dependencies
 */
import type { DomainContactDetails } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { WPCOMTransactionEndpointCart } from './transaction-endpoint';

export type PayPalExpressEndpoint = (
	_: PayPalExpressEndpointRequestPayload
) => Promise< PayPalExpressEndpointResponse >;

export type PayPalExpressEndpointRequestPayload = {
	successUrl: string;
	cancelUrl: string;
	cart: WPCOMTransactionEndpointCart;
	domainDetails: DomainContactDetails | null;
	country: string;
	postalCode: string;
};

export type PayPalExpressEndpointResponse = unknown;
