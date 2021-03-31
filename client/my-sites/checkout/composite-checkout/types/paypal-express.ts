/**
 * Internal dependencies
 */
import type { DomainContactDetails } from 'calypso/my-sites/checkout/composite-checkout/types/backend/domain-contact-details-components';
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
