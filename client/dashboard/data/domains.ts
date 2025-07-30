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
	is_eligible_for_inbound_transfer: boolean;
	is_hundred_year_domain: boolean;
	is_wpcom_staging_domain: boolean;
	primary_domain: boolean;
	site_slug: string;
	type: `${ DomainTypes }`;
	wpcom_domain: boolean;
}

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
