/*
 * The data model used in ContactDetailsFormFields and related components.
 * This belongs in components/domains/contact-details-form-fields, but until
 * that component is rewritten in TypeScript we'll put it here.
 *
 * @see components/domains/contact-details-form-fields
 * @see components/domains/registrant-extra-info
 */

export type DomainContactDetails = {
	firstName?: string;
	lastName?: string;
	organization?: string;
	email?: string;
	alternateEmail?: string;
	phone?: string;
	address1?: string;
	address2?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	countryCode?: string;
	fax?: string;
	vatId?: string;
	extra?: DomainContactDetailsExtra;
};

type DomainContactDetailsExtra = {
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
	sirenSirat?: string;
};

// This is the data returned by the redux state, where the fields could have a
// null value.
export type PossiblyCompleteDomainContactDetails = {
	firstName: string | null;
	lastName: string | null;
	organization: string | null;
	email: string | null;
	alternateEmail: string | null;
	phone: string | null;
	address1: string | null;
	address2: string | null;
	city: string | null;
	state: string | null;
	postalCode: string | null;
	countryCode: string | null;
	fax: string | null;
};

export type DomainContactDetailsErrors = {
	firstName?: string;
	lastName?: string;
	organization?: string;
	email?: string;
	alternateEmail?: string;
	phone?: string;
	address1?: string;
	address2?: string;
	city?: string;
	state?: string;
	postalCode?: string;
	countryCode?: string;
	fax?: string;
	vatId?: string;
	extra?: DomainContactDetailsErrorsExtra;
};

type DomainContactDetailsErrorsExtra = {
	ca?: CaDomainContactExtraDetailsErrors | null;
	uk?: UkDomainContactExtraDetailsErrors | null;
	fr?: FrDomainContactExtraDetailsErrors | null;
};

export type CaDomainContactExtraDetailsErrors = {
	lang?: string;
	legalType?: string;
	ciraAgreementAccepted?: string;
};

export type UkDomainContactExtraDetailsErrors = {
	registrantType?: { errorCode: string; errorMessage: string }[];
	registrationNumber?: { errorCode: string; errorMessage: string }[];
	tradingName?: { errorCode: string; errorMessage: string }[];
};

export type FrDomainContactExtraDetailsErrors = {
	registrantType?: string;
	registrantVatId?: string;
	trademarkNumber?: string;
	sirenSirat?: string;
};
