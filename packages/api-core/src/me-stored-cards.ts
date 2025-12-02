import { wpcom } from './wpcom-fetcher';
import type { StoredPaymentMethod } from './me-payment-methods';

export interface SaveCreditCardParams {
	paymentKey: string;
	useForExisting: boolean;
	paymentPartner?: string;
	paygateToken?: string;
	postalCode?: string;
	countryCode?: string;
	taxSubdivisionCode?: string;
	taxCity?: string;
	taxOrganization?: string;
	taxAddress?: string;
	taxIsForBusiness?: boolean;
	setupKey?: string;
}

export async function saveCreditCard(
	params: SaveCreditCardParams
): Promise< StoredPaymentMethod > {
	return await wpcom.req.post( {
		path: '/me/stored-cards',
		apiVersion: '1.1',
		body: {
			payment_key: params.paymentKey,
			use_for_existing: params.useForExisting,
			payment_partner: params.paymentPartner,
			paygate_token: params.paygateToken,
			postal_code: params.postalCode ?? '',
			country_code: params.countryCode,
			tax_subdivision_code: params.taxSubdivisionCode,
			tax_city: params.taxCity,
			tax_organization: params.taxOrganization,
			tax_address: params.taxAddress,
			tax_is_for_business: params.taxIsForBusiness ?? '',
			setup_key: params.setupKey,
		},
	} );
}
