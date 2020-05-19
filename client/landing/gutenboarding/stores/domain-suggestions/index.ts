/**
 * External dependencies
 */
import { DomainSuggestions } from '@automattic/data-stores';
import { getSignupDomainsSuggestionsVendor } from '../../utils/domain-suggestions';

export const DOMAIN_SUGGESTIONS_STORE = DomainSuggestions.register( {
	vendor: getSignupDomainsSuggestionsVendor(),
} );
