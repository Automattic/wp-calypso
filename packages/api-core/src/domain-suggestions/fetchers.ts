import { wpcom } from '../wpcom-fetcher';
import type {
	BundleSuggestion,
	BundleSuggestionDomain,
	DomainSuggestion,
	DomainSuggestionQuery,
	FreeDomainSuggestion,
} from './types';

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

	const suggestions: DomainSuggestion[] = await wpcom.req.get( '/domains/suggestions', {
		...defaultDomainSuggestionQuery,
		...domainSuggestionQuery,
		query: search.trim().toLocaleLowerCase(),
		apiVersion: '1.1',
	} );

	return suggestions;
}

export async function fetchFreeDomainSuggestion(
	search: string,
	params: Partial< DomainSuggestionQuery > = {}
): Promise< FreeDomainSuggestion > {
	const [ suggestion ] = await wpcom.req.get(
		{
			apiVersion: '1.1',
			path: '/domains/suggestions',
		},
		{
			quantity: 1,
			include_wordpressdotcom: true,
			include_dotblogsubdomain: false,
			only_wordpressdotcom: false,
			vendor: 'dot',
			query: search.trim().toLocaleLowerCase(),
			...params,
		}
	);

	if ( ! suggestion ) {
		throw new Error( `No free domain suggestion found for query ${ search }` );
	}

	return suggestion;
}

export async function fetchAvailableTlds( search?: string, vendor?: string ): Promise< string[] > {
	const defaultAvailableTldsQuery = {
		vendor: 'variation2_front',
	};

	const tlds = await wpcom.req.get(
		{
			apiVersion: '1.1',
			path: '/domains/suggestions/tlds',
		},
		{
			...defaultAvailableTldsQuery,
			search,
			vendor,
		}
	);

	return tlds;
}

/**
 * Fetch a bundle suggestion for a search query.
 *
 * M1a placeholder: returns hardcoded fixture data shaped like the
 * `with_bundles=1` payload (DOMAINS-2166) so the search flow can render the
 * bundle card end-to-end before the backend is wired up. M1b replaces the body
 * with a real network call without changing this signature.
 * @param search The domain search query (an SLD or FQDN).
 * @returns A bundle suggestion, or null when no bundle applies.
 */
export async function fetchBundleSuggestion( search: string ): Promise< BundleSuggestion | null > {
	const sld = search.trim().toLowerCase().split( '.' )[ 0 ];

	if ( ! sld ) {
		return null;
	}

	const domains: BundleSuggestionDomain[] = [
		{
			domain: `${ sld }.com`,
			cost: '$22.00',
			raw_price: 22,
			product_slug: 'domain_reg',
			supports_privacy: true,
		},
		{
			domain: `${ sld }.net`,
			cost: '$18.00',
			raw_price: 18,
			product_slug: 'domain_reg',
			supports_privacy: true,
		},
		{
			domain: `${ sld }.org`,
			cost: '$20.00',
			raw_price: 20,
			product_slug: 'domain_reg',
			supports_privacy: true,
		},
	];

	return {
		sld,
		domains,
		bundle_price: 48,
		original_price: 60,
		discount_percent: 20,
		category: 'business',
		bundle_id: `${ sld }_business`,
		bundle_group_id: `mock-${ sld }-group`,
		catalogue_version: '1',
	};
}
