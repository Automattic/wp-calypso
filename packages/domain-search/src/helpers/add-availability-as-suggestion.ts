import { type DomainAvailability, type DomainSuggestion } from '@automattic/api-core';
import { convertAvailabilityToSuggestion } from './convert-availability-to-suggestion';

export const addAvailabilityAsSuggestion = (
	suggestions: DomainSuggestion[],
	fqdnAvailability: DomainAvailability
): DomainSuggestion[] => {
	const isFQDNAlreadyInSuggestions = suggestions.some(
		( suggestion ) => suggestion.domain_name === fqdnAvailability.domain_name
	);
	if ( ! isFQDNAlreadyInSuggestions ) {
		// An FQDN search should always be the first suggestion, so we add it to the
		// beginning of the suggestions list
		suggestions.unshift( convertAvailabilityToSuggestion( fqdnAvailability ) );
	}
	return suggestions;
};
