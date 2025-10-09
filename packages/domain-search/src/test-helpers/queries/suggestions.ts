import nock from 'nock';
import qs from 'qs';
import type {
	DomainSuggestion,
	DomainSuggestionQuery,
	FreeDomainSuggestion,
} from '@automattic/api-core';

export const mockGetSuggestionsQuery = ( {
	params: rawParams,
	suggestions,
}: {
	params: Partial< DomainSuggestionQuery >;
	suggestions: DomainSuggestion[];
} ) => {
	const params = {
		include_wordpressdotcom: false,
		include_dotblogsubdomain: false,
		only_wordpressdotcom: false,
		quantity: 30,
		vendor: 'variation2_front',
		exact_sld_matches_only: false,
		include_internal_move_eligible: true,
		...rawParams,
	};

	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/domains/suggestions' )
		.query( qs.stringify( params, { arrayFormat: 'brackets' } ) )
		.reply( 200, suggestions );
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
