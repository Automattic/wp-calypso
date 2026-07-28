export type DomainContactDetails = {
	firstName?: string;
	lastName?: string;
	organization?: string;
	email?: string;
	phone?: string;
	address1?: string;
	address2?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	countryCode?: string;
	fax?: string;
	vatId?: string;
	optOutTransferLock: boolean;
	extra?: DomainContactDetailsExtra;
};

export type DomainContactValidationRequestExtraFields = {
	ca?: {
		lang?: string;
		legal_type?: string;
		cira_agreement_accepted?: boolean;
	};
	uk?: {
		registrant_type?: string;
		registration_number?: string;
		trading_name?: string;
	};
	fr?: {
		registrant_type?: string;
		registrant_vat_id?: string;
		trademark_number?: string;
		siren_siret?: string;
	};
	is_for_business?: boolean;
};

/**
 * Request parameter expected by the domain contact validation endpoint.
 * @see WPCOM_JSON_API_Domains_Validate_Contact_Information_Endpoint
 */
export type ContactValidationRequestContactInformation = {
	address_1?: string;
	address_2?: string;
	city?: string;
	country_code?: string;
	email?: string;
	extra?: DomainContactValidationRequestExtraFields;
	fax?: string;
	first_name?: string;
	last_name?: string;
	organization?: string;
	phone?: string;
	phone_number_country?: string;
	postal_code?: string;
	state?: string;
	vat_id?: string;
};

/**
 * Per-field validation messages, keyed by the name of the field that failed.
 *
 * The map is always flat. Errors on nested properties carry a dot-qualified key
 * rather than a nested object — a failing `.uk` registrant type arrives as
 * `{ 'extra.uk.registrant_type': [ … ] }`, never as
 * `{ extra: { uk: { registrant_type: [ … ] } } }`. The per-TLD JSON schemas set
 * those qualified names explicitly via `error_field`, so they are identical on
 * v1.1 and v1.2 of the endpoint.
 */
export type ContactValidationResponseMessages = Record< string, string[] >;

export type DomainContactValidationResponse =
	| { success: true }
	| {
			success: false;
			messages: ContactValidationResponseMessages;
			messages_simple: string[];
	  };

export type DomainContactDetailsExtra = {
	ca?: CaDomainContactExtraDetails | null;
	uk?: UkDomainContactExtraDetails | null;
	fr?: FrDomainContactExtraDetails | null;
};

export type CaDomainContactExtraDetails = {
	lang?: string;
	legalType?: string;
	ciraAgreementAccepted?: boolean;
};

export type UkDomainContactExtraDetails = {
	registrantType?: string;
	registrationNumber?: string;
	tradingName?: string;
};

export type FrDomainContactExtraDetails = {
	registrantType?: string;
	registrantVatId?: string;
	trademarkNumber?: string;
	sirenSiret?: string;
};
export interface WhoisDataEntry {
	fname: string;
	lname: string;
	country_code: string;
	org: string;
	email: string;
	sa1: string;
	sa2: string;
	city: string;
	sp: string;
	pc: string;
	cc: string;
	phone: string;
	fax: string;
	state: string;
	type: WhoisType;
}

export interface WhoisEmailRecord {
	type: string;
	forwards: string[] | null;
	mx_servers: string[] | null;
	max_forwards: number | null;
}

export interface WhoisPrivacy {
	private: boolean;
	available: boolean;
}

export interface WhoisDnsRecord {
	id: string;
	name: string;
	type: string;
	domain: string;
	protected_field: boolean;
}

export interface WhoisData {
	type: 'registration' | 'redirect' | 'mapping';
	verified: boolean;
	locked: boolean;
	maybe_pending_transfer: boolean;
	nameservers: string[];
	whois: WhoisDataEntry;
	email: WhoisEmailRecord;
	privacy: false | WhoisPrivacy;
	dns: { records: WhoisDnsRecord[] };
	sitename: string;
}

export enum WhoisType {
	REGISTRANT = 'registrant',
	PRIVACY_SERVICE = 'privacy_service',
}
