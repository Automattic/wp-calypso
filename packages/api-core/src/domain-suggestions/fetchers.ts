import { wpcom } from '../wpcom-fetcher';
import type {
	BundleMetadata,
	BundleSuggestion,
	DomainSuggestion,
	DomainSuggestionQuery,
	DomainSuggestionRequestContext,
	FreeDomainSuggestion,
} from './types';

const DEFAULT_DOMAIN_SUGGESTION_QUERY = {
	include_wordpressdotcom: false,
	include_dotblogsubdomain: false,
	only_wordpressdotcom: false,
	quantity: 5,
	vendor: 'variation2_front',
};

export async function fetchDomainSuggestions(
	search: string,
	domainSuggestionQuery: Partial< DomainSuggestionQuery > = {}
): Promise< DomainSuggestion[] > {
	const suggestions: DomainSuggestion[] = await wpcom.req.get( '/domains/suggestions', {
		...DEFAULT_DOMAIN_SUGGESTION_QUERY,
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
 * Fetch the bundle metadata for a search query.
 *
 * Calls the `with_bundles=1` opt-in on `/domains/suggestions` (DOMAINS-2166 /
 * DOMAINS-2207), which wraps the response as
 * `{ domain_suggestions, bundle_suggestion, bundle_triggers }`. We return the
 * two bundle fields together so a single request serves both consumers:
 * `bundle_suggestion` powers the top `BundleCard` on an FQDN query, while
 * `bundle_triggers` is the cheap catalogue of TLDs (currently just `com`) that
 * offer an inline bundle when added to the cart. The backend gates each field
 * on its own feature flag and omits it when nothing applies; this fetcher
 * normalises a missing suggestion to `null` and missing triggers to `[]`. The
 * frontend `domain-bundling` flag additionally gates whether the query runs at
 * all (see the `bundleMetadataQuery` consumers).
 * `params` are the plain suggestions request's params, so the backend sees the
 * same list the client renders (DOMAINS-2238).
 * @param search The domain search query (an SLD or FQDN).
 * @param params The plain suggestions request's params, including the analytics context (`flow_name`, `section`, `search_id`) recorded by the server.
 * @returns The bundle suggestion (or null), the trigger TLDs (or []) and the result set id (or null).
 */
export async function fetchBundleMetadata(
	search: string,
	params: Partial< DomainSuggestionQuery > = {}
): Promise< BundleMetadata > {
	const response: {
		domain_suggestions?: DomainSuggestion[];
		bundle_suggestion?: BundleSuggestion | null;
		bundle_triggers?: string[];
		result_set_id?: string;
	} = await wpcom.req.get(
		{
			apiVersion: '1.1',
			path: '/domains/suggestions',
		},
		{
			...DEFAULT_DOMAIN_SUGGESTION_QUERY,
			...params,
			query: search.trim().toLocaleLowerCase(),
			with_bundles: 1,
		}
	);

	return {
		bundle_suggestion: response.bundle_suggestion ?? null,
		bundle_triggers: response.bundle_triggers ?? [],
		result_set_id:
			response.result_set_id ?? response.domain_suggestions?.[ 0 ]?.result_set_id ?? null,
	};
}

/**
 * Fetch the bundle suggestion for a single fully-qualified domain.
 *
 * Calls the per-FQDN `GET /wpcom/v2/domains/bundle` endpoint (DOMAINS-2207),
 * used lazily by the inline-bundle frontend once the user adds a trigger domain
 * (e.g. `flowers.com`) to the cart. The endpoint serves anonymous callers too
 * (DOMAINS-2239: the group id is not bound to a user), is flag-gated (404 when
 * off) and query-guarded (400 on empty query); it returns
 * `{ bundle_suggestion: BundleSuggestion | null }`, where the added
 * domain is the `primary` member and the rest are `companion`s.
 * @param fqdn The fully-qualified trigger domain (e.g. "flowers.com").
 * @param context Analytics context (`flow_name`, `section`, `search_id`) recorded by the server.
 * @returns A bundle suggestion, or null when no bundle applies.
 */
export async function fetchBundleForDomain(
	fqdn: string,
	context: DomainSuggestionRequestContext = {}
): Promise< BundleSuggestion | null > {
	const response: { bundle_suggestion?: BundleSuggestion | null } = await wpcom.req.get(
		{
			path: '/domains/bundle',
			apiNamespace: 'wpcom/v2',
		},
		{
			...context,
			query: fqdn.trim().toLocaleLowerCase(),
		}
	);

	return response.bundle_suggestion ?? null;
}
