import nock from 'nock';
import qs from 'qs';
import type {
	BundleSuggestion,
	DomainSuggestion,
	DomainSuggestionQuery,
	FreeDomainSuggestion,
} from '@automattic/api-core';

// The domain-search context stamps `search_id` (a fresh uuid per search) plus
// `flow_name` / `section` on every suggestions and bundle request. Match the
// remaining params exactly, ignoring those three, so tests stay deterministic.
export const matchesQueryIgnoringContext =
	( params: Record< string, unknown > ) =>
	( actual: Record< string, string | string[] | undefined > ) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { search_id, flow_name, section, ...rest } = actual;

		// nock hands us a flat `querystring`-style object (`tlds[]` keys); rebuild the
		// query string so both sides go through the same `qs` parser.
		const actualSearchParams = new URLSearchParams();
		Object.entries( rest ).forEach( ( [ key, value ] ) => {
			( Array.isArray( value ) ? value : [ value ?? '' ] ).forEach( ( item ) =>
				actualSearchParams.append( key, item )
			);
		} );

		const normalize = ( value: Record< string, unknown > ) =>
			JSON.stringify( value, Object.keys( value ).sort() );

		return (
			normalize( qs.parse( actualSearchParams.toString() ) ) ===
			normalize( qs.parse( qs.stringify( params, { arrayFormat: 'brackets' } ) ) )
		);
	};

export const mockGetSuggestionsQuery = ( {
	params: rawParams,
	suggestions,
	delayMs,
}: {
	params: Partial< DomainSuggestionQuery >;
	suggestions: DomainSuggestion[] | Error;
	/** Response delay in ms, to make one request settle after another. */
	delayMs?: number;
} ) => {
	const params = {
		include_wordpressdotcom: false,
		include_dotblogsubdomain: false,
		only_wordpressdotcom: false,
		quantity: 30,
		vendor: 'variation2_front',
		exact_sld_matches_only: false,
		include_internal_move_eligible: false,
		...rawParams,
	};

	const request = nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/domains/suggestions' )
		.query( matchesQueryIgnoringContext( params ) );

	if ( delayMs ) {
		request.delay( delayMs );
	}

	if ( suggestions instanceof Error ) {
		return request.replyWithError( suggestions );
	}

	return request.reply( 200, suggestions );
};

// `bundle_suggestion` and `bundle_triggers` come back on ONE shared
// `with_bundles=1` request (see bundleMetadataQuery), so composing
// mockGetBundleSuggestionQuery + mockGetBundleTriggersQuery for the same query
// does NOT work — only the first-registered nock interceptor is consumed and
// the other half of the payload is silently absent. When a test needs both
// fields on the same query, use this combined helper instead.
export const mockGetBundleMetadataQuery = ( {
	params: rawParams,
	bundleSuggestion = null,
	bundleTriggers = [],
	delayMs,
}: {
	params: Partial< DomainSuggestionQuery >;
	bundleSuggestion?: BundleSuggestion | null;
	bundleTriggers?: string[];
	/** Hold the reply so a test can observe the in-flight state. */
	delayMs?: number;
} ) => {
	// The wrapped request carries the plain request's params plus with_bundles
	// (DOMAINS-2238), so the expected query mirrors mockGetSuggestionsQuery.
	const params = {
		include_wordpressdotcom: false,
		include_dotblogsubdomain: false,
		only_wordpressdotcom: false,
		quantity: 30,
		vendor: 'variation2_front',
		exact_sld_matches_only: false,
		include_internal_move_eligible: false,
		...rawParams,
		with_bundles: 1,
	};

	const request = nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/domains/suggestions' )
		.query( matchesQueryIgnoringContext( params ) );

	return ( delayMs ? request.delay( delayMs ) : request ).reply( 200, {
		bundle_suggestion: bundleSuggestion,
		bundle_triggers: bundleTriggers,
	} );
};

export const mockGetBundleSuggestionQuery = ( {
	params,
	bundleSuggestion,
	delayMs,
}: {
	params: Partial< DomainSuggestionQuery >;
	bundleSuggestion: BundleSuggestion | null;
	delayMs?: number;
} ) => {
	return mockGetBundleMetadataQuery( { params, bundleSuggestion, delayMs } );
};

export const mockGetBundleTriggersQuery = ( {
	params,
	bundleTriggers,
}: {
	params: Partial< DomainSuggestionQuery >;
	bundleTriggers: string[];
} ) => {
	return mockGetBundleMetadataQuery( { params, bundleTriggers } );
};

export const mockGetBundleForDomainQuery = ( {
	fqdn,
	bundleSuggestion,
}: {
	fqdn: string;
	bundleSuggestion: BundleSuggestion | null;
} ) => {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/wpcom/v2/domains/bundle' )
		.query( matchesQueryIgnoringContext( { query: fqdn } ) )
		.reply( 200, { bundle_suggestion: bundleSuggestion } );
};

export const mockGetFreeSuggestionQuery = ( {
	params,
	freeSuggestion,
}: {
	params: Partial< DomainSuggestionQuery >;
	freeSuggestion: FreeDomainSuggestion;
} ) => {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/domains/suggestions' )
		.query( {
			quantity: 1,
			include_wordpressdotcom: true,
			include_dotblogsubdomain: false,
			only_wordpressdotcom: false,
			vendor: 'dot',
			...params,
		} )
		.reply( 200, [ freeSuggestion ] );
};
