/**
 * External dependencies
 */
import { DomainSuggestions } from '@automattic/data-stores';
import { getSuggestionsVendor } from '../../../../lib/domains/suggestions';

export const DOMAIN_SUGGESTIONS_STORE = DomainSuggestions.register( {
	vendor: getSuggestionsVendor( true ),
} );
