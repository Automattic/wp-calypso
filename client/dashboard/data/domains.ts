import wpcom from 'calypso/lib/wp';
import type { DomainSuggestion, DomainSuggestionQuery } from '@automattic/data-stores'; // eslint-disable-line

// Export types again to avoid other places to access `@automattic/data-stores`.
export type { DomainSuggestion, DomainSuggestionQuery };

export enum DomainTypes {
	MAPPED = 'mapping',
	REGISTERED = 'registered',
	SITE_REDIRECT = 'redirect',
	WPCOM = 'wpcom',
	TRANSFER = 'transfer',
}

export interface Domain {
	auto_renewing: boolean;
	blog_id: number;
	blog_name: string;
	domain: string;
	domain_status?: {
		status: string;
	};
	expiry: string | false;
	is_dnssec_enabled: boolean;
	is_dnssec_supported: boolean;
	is_eligible_for_inbound_transfer: boolean;
	is_hundred_year_domain: boolean;
	is_wpcom_staging_domain: boolean;
	primary_domain: boolean;
	site_slug: string;
	type: `${ DomainTypes }`;
	wpcom_domain: boolean;
}

export interface DNSSECDSData {
	rdata: string;
	key_tag: number;
	algorithm: number;
	digest_type: number;
	digest: string;
}

export interface DNSSECDNSKey {
	rdata: string;
	flags: number;
	protocol: number;
	algorithm: number;
	public_key: string;
}

export interface DNSSECCryptokey {
	dnskey: DNSSECDNSKey;
	ds_data: DNSSECDSData[];
}

export type DNSSECResponse = {
	data?: {
		cryptokeys: DNSSECCryptokey[];
		dnssec_data_set_at_registry: boolean;
	} | null;
	status: string;
};

export async function fetchDomains(): Promise< Domain[] > {
	const { domains } = await wpcom.req.get( '/all-domains', {
		no_wpcom: true,
		resolve_status: true,
	} );
	return domains;
}

export async function fetchDomainSuggestions(
	search: string,
	domainSuggestionQuery: Partial< DomainSuggestionQuery > = {}
): Promise< DomainSuggestion[] > {
	const defaultDomainSuggestionQuery = {
		include_wordpressdotcom: false,
		include_dotblogsubdomain: false,
		only_wordpressdotcom: false,
		quantity: 5,
		vendor: 'variation2_front',
	};

	const suggestions: DomainSuggestion[] = await wpcom.req.get(
		{
			apiVersion: '1.1',
			path: '/domains/suggestions',
		},
		{
			...defaultDomainSuggestionQuery,
			...domainSuggestionQuery,
			query: search.trim().toLocaleLowerCase(),
		}
	);

	return suggestions;
}

export async function updateDNSSEC( domain: string, enabled: boolean ): Promise< DNSSECResponse > {
	return wpcom.req.post( {
		path: `/domains/dnssec/${ domain }`,
		apiNamespace: 'wpcom/v2',
		...( ! enabled && { method: 'DELETE' } ),
	} );
}
