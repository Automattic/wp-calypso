/**
 * Request parameter expected by the domain contact validation endpoint.
 *
 * @see WPCOM_JSON_API_Domains_Validate_Contact_Information_Endpoint
 */
export type DomainContactValidationRequest = {
	domain_names: string[];
	contact_information: {
		firstName: string;
		lastName: string;
		organization: string;
		email: string;
		alternateEmail: string;
		phone: string;
		phoneNumberCountry: string;
		address1: string;
		address2: string;
		city: string;
		state: string;
		postalCode: string;
		countryCode: string;
		fax: string;
		vatId: string;
		extra?: DomainContactValidationRequestExtraFields;
	};
};

export type DomainContactValidationRequestExtraFields = {
	ca?: {
		lang: string;
		legal_type: string;
		cira_agreement_accepted: boolean;
	};
	uk?: {
		registrant_type: string;
		registration_number: string;
		trading_name: string;
	};
	fr?: {
		registrant_type: string;
		trademark_number: string;
		siren_sirat: string;
	};
};

/**
 * Response format of the domain contact validation endpoint.
 */
export type DomainContactValidationResponse = {
	success: boolean;
	messages: {
		firstName?: string[];
		lastName?: string[];
		organization?: string[];
		email?: string[];
		alternateEmail?: string[];
		phone?: string[];
		phoneNumberCountry?: string[];
		address1?: string[];
		address2?: string[];
		city?: string[];
		state?: string[];
		postalCode?: string[];
		countryCode?: string[];
		fax?: string[];
		vatId?: string[];
		extra?: {
			ca?: {
				lang?: string[];
				legalType?: string[];
				ciraAgreementAccepted?: string[];
			};
			uk?: {
				registrantType?: string[];
				registrationNumber?: string[];
				tradingName?: string[];
			};
			fr?: {
				registrantType?: string[];
				trademarkNumber?: string[];
				sirenSirat?: string[];
			};
		};
	};
};
