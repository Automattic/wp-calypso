import { wpcom } from './wpcom-fetcher';

export interface CreatePayPalAgreementParams {
	subscriptionId: string;
	successUrl: string;
	cancelUrl: string;
	taxCountryCode: string;
	taxPostalCode: string;
	taxAddress: string;
	taxOrganization: string;
	taxCity: string;
	taxSubdivisionCode: string;
}

export async function createPayPalAgreement(
	params: CreatePayPalAgreementParams
): Promise< string > {
	return await wpcom.req.post( {
		path: '/payment-methods/create-paypal-agreement',
		apiVersion: '1',
		body: {
			subscription_id: params.subscriptionId,
			success_url: params.successUrl,
			cancel_url: params.cancelUrl,
			tax_postal_code: params.taxPostalCode,
			tax_country_code: params.taxCountryCode,
			tax_address: params.taxAddress,
			tax_organization: params.taxOrganization,
			tax_city: params.taxCity,
			tax_subdivision_code: params.taxSubdivisionCode,
		},
	} );
}
