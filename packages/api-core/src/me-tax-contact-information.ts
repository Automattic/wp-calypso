import { wpcom } from './wpcom-fetcher';

export interface ValidateTaxContactInfoParams {
	contact_information: {
		country_code?: string;
		postal_code?: string;
		address_1?: string;
		city?: string;
		state?: string;
		organization?: string;
	};
}

export interface TaxValidationResponse {
	success: boolean;
	messages?: Record< string, string[] >;
	messages_simple?: string[];
}

export async function validateTaxContactInformation(
	params: ValidateTaxContactInfoParams
): Promise< TaxValidationResponse > {
	return await wpcom.req.post( {
		path: '/me/tax-contact-information/validate',
		body: params,
	} );
}
