/**
 * External dependencies
 */
import { DomainSuggestions } from '@automattic/data-stores';
import { getSuggestionsVendor } from 'lib/domains/suggestions';

export const DOMAIN_SUGGESTIONS_STORE = DomainSuggestions.register( {
	/* Returns an ID for the domain suggestions vendor. Passing `true` to getSuggestionsVendor returns the signup variant.*/
	vendor: getSuggestionsVendor( { isSignup: true } ),
} );
