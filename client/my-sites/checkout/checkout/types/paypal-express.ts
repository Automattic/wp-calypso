/**
 * Internal dependencies
 */
import {
	WPCOMTransactionEndpointCart,
	WPCOMTransactionEndpointDomainDetails,
	createTransactionEndpointCartFromLineItems,
} from './transaction-endpoint';

export type PayPalExpressCart = {
	successUrl: string;
	cancelUrl: string;
	cart: WPCOMTransactionEndpointCart;
	domainDetails: WPCOMTransactionEndpointDomainDetails;
	country: string;
	postalCode: string;
};

export function createPayPalExpressCartFromLineItems( {
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
	items: {
		type: string;
		amount: {
			currency: string;
		};
		wpcom_meta: {
			product_id: string;
			meta?: string;
			currency: string;
			volume?: number;
			extra?: string[];
		};
	}[];
} ): PayPalExpressCart {
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
