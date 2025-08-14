import wpcom from 'calypso/lib/wp';
import { camelToSnakeCase, mapRecordKeysRecursively } from '../utils/domain';

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

export const whoisType = {
	REGISTRANT: 'registrant',
	PRIVACY_SERVICE: 'privacy_service',
};

export function fetchDomainWhois( domainName: string ): Promise< WhoisData > {
	return wpcom.req.get( {
		path: `/domains/${ domainName }/whois`,
		apiVersion: '1.1',
	} );
}

export function updateDomainWhois(
	domainName: string,
	domainContactDetails: DomainContactDetails,
	transferLock: boolean
): Promise< WhoisData > {
	return wpcom.req.post( {
		path: `/domains/${ domainName }/whois`,
		apiVersion: '1.1',
		body: {
			whois: domainContactDetails,
			transfer_lock: transferLock,
		},
	} );
}

export function fetchDomainWhoisValidate(
	domainName: string,
	domainContactDetails: DomainContactDetails
): Promise< WhoisData > {
	return wpcom.req.post( {
		path: '/me/domain-contact-information/validate',
		apiVersion: '1.1',
		body: mapRecordKeysRecursively(
			{
				contactInformation: domainContactDetails,
				domainNames: [ domainName ],
			},
			camelToSnakeCase
		),
	} );
}
