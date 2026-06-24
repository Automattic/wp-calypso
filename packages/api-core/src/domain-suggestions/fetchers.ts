import { wpcom } from '../wpcom-fetcher';
import type {
	BundleSuggestion,
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
 * Calls the `with_bundles=1` opt-in on `/domains/suggestions` (DOMAINS-2166),
 * which wraps the response as `{ domain_suggestions, bundle_suggestion }`. We
 * only need the `bundle_suggestion` portion here. The backend gates the bundle
 * on its own feature flag and returns `null` when no bundle applies; the
 * frontend `domain-bundling` flag additionally gates whether this fetcher runs
 * at all (see the `bundleSuggestionQuery` consumer).
 * @param search The domain search query (an SLD or FQDN).
 * @returns A bundle suggestion, or null when no bundle applies.
 */
export async function fetchBundleSuggestion( search: string ): Promise< BundleSuggestion | null > {
	const response: { bundle_suggestion?: BundleSuggestion | null } = await wpcom.req.get(
		{
			apiVersion: '1.1',
			path: '/domains/suggestions',
		},
		{
			query: search.trim().toLocaleLowerCase(),
			vendor: 'variation2_front',
			with_bundles: 1,
		}
	);

	return response.bundle_suggestion ?? null;
}
