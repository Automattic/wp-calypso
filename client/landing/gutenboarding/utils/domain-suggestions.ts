type DomainSuggestion = import('@automattic/data-stores').DomainSuggestions.DomainSuggestion;

export function getFreeDomainSuggestions( allSuggestions: DomainSuggestion[] | undefined ) {
	return allSuggestions?.filter( ( suggestion ) => suggestion.is_free );
}
