import nock from 'nock';
import type { DomainSuggestion, FreeDomainSuggestion } from '@automattic/api-core';

export const mockGetSuggestions = ( query: string, suggestions: DomainSuggestion[] ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/domains/suggestions' )
		.query( {
			include_wordpressdotcom: false,
			include_dotblogsubdomain: false,
			only_wordpressdotcom: false,
			quantity: 30,
			vendor: 'variation2_front',
			exact_sld_matches_only: false,
			include_internal_move_eligible: true,
			query,
		} )
		.reply( 200, suggestions );
};

export const mockGetFreeSuggestion = ( query: string, freeSuggestion: FreeDomainSuggestion ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/domains/suggestions' )
		.query( {
			quantity: 1,
			include_wordpressdotcom: true,
			include_dotblogsubdomain: false,
			only_wordpressdotcom: false,
			vendor: 'dot',
			query,
		} )
		.reply( 200, [ freeSuggestion ] );
};
