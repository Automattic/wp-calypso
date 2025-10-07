import nock from 'nock';
import type { DomainSuggestion } from '@automattic/api-core';

export const mockGetSuggestions = ( suggestions: DomainSuggestion[] ) => {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/domains/suggestions' )
		.reply( 200, { body: suggestions } );
};
