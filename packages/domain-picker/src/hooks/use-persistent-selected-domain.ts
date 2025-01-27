import { useState, useEffect, useMemo } from 'react';
import type { DomainSuggestions } from '@automattic/data-stores';

type DomainSuggestion = DomainSuggestions.DomainSuggestion;

export function usePersistentSelectedDomain(
	domainSuggestions?: DomainSuggestion[],
	existingSubdomain?: DomainSuggestion,
	currentDomain?: DomainSuggestion
): DomainSuggestion | undefined {
	// Keep the users selected domain in local state so we can always show it to the user.
	const [ persistentSelectedDomain, setPersistentSelectedDomain ] = useState<
		DomainSuggestion | undefined
	>();

	// Make a complete list of suggestions with the subdomain
	const domainSuggestionsWithSubdomain = useMemo(
		() =>
			existingSubdomain && Array.isArray( domainSuggestions )
				? [ existingSubdomain, ...domainSuggestions ]
				: domainSuggestions,
		[ domainSuggestions, existingSubdomain ]
	);

	useEffect( () => {
		const currentDomainIsInSuggestions = domainSuggestionsWithSubdomain?.some(
			( suggestion ) => suggestion.domain_name === currentDomain?.domain_name
		);

		if ( domainSuggestionsWithSubdomain?.length && ! currentDomainIsInSuggestions ) {
			setPersistentSelectedDomain( currentDomain );
		}
	}, [ currentDomain, domainSuggestionsWithSubdomain ] );

	const persistentSelectedDomainIsInSuggestions = domainSuggestionsWithSubdomain?.some(
		( suggestion ) => suggestion?.domain_name === persistentSelectedDomain?.domain_name
	);

	if ( persistentSelectedDomainIsInSuggestions ) {
		return;
	}

	return persistentSelectedDomain;
}
