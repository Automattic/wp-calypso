import { type DomainAvailability, type DomainSuggestion } from '@automattic/api-core';
import { convertAvailabilityToSuggestion } from './convert-availability-to-suggestion';

export const addAvailabilityAsSuggestion = (
	suggestions: DomainSuggestion[],
	fqdnAvailability: DomainAvailability
): DomainSuggestion[] => {
	const isFQDNAlreadyInSuggestions = suggestions.some(
		( suggestion ) => suggestion.domain_name === fqdnAvailability.domain_name
	);
	if ( isFQDNAlreadyInSuggestions ) {
		return suggestions;
	}

	// An FQDN search should always be the first suggestion, so we add it to the
	// beginning of the suggestions list. This builds a new array so the cached
	// query data is left untouched.
	return [ convertAvailabilityToSuggestion( fqdnAvailability ), ...suggestions ];
};
