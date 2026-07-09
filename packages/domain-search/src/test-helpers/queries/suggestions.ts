import nock from 'nock';
import qs from 'qs';
import type {
	BundleSuggestion,
	DomainSuggestion,
	DomainSuggestionQuery,
	FreeDomainSuggestion,
} from '@automattic/api-core';

export const mockGetSuggestionsQuery = ( {
	params: rawParams,
	suggestions,
}: {
	params: Partial< DomainSuggestionQuery >;
	suggestions: DomainSuggestion[] | Error;
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
		.query( qs.stringify( params, { arrayFormat: 'brackets' } ) );

	if ( suggestions instanceof Error ) {
		return request.replyWithError( suggestions );
	}

	return request.reply( 200, suggestions );
};

export const mockGetBundleSuggestionQuery = ( {
	params,
	bundleSuggestion,
}: {
	params: Partial< DomainSuggestionQuery >;
	bundleSuggestion: BundleSuggestion | null;
} ) => {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/domains/suggestions' )
		.query( {
			vendor: 'variation2_front',
			with_bundles: 1,
			...params,
		} )
		.reply( 200, { bundle_suggestion: bundleSuggestion } );
};

export const mockGetBundleTriggersQuery = ( {
	params,
	bundleTriggers,
}: {
	params: Partial< DomainSuggestionQuery >;
	bundleTriggers: string[];
} ) => {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/domains/suggestions' )
		.query( {
			vendor: 'variation2_front',
			with_bundles: 1,
			...params,
		} )
		.reply( 200, { bundle_triggers: bundleTriggers } );
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
		.query( { query: fqdn } )
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
