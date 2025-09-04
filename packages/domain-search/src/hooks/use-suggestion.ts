import { useQuery } from '@tanstack/react-query';
import { useDomainSearch } from '../page/context';

export const useSuggestion = ( domainName: string ) => {
	const { query, queries, filter, getPriceRuleForSuggestion } = useDomainSearch();

	const { data: suggestion } = useQuery( {
		...queries.domainSuggestions( query, {
			tlds: filter.tlds,
			exact_sld_matches_only: filter.exactSldMatchesOnly,
		} ),
		select: ( data ) => {
			const suggestion = data.find( ( suggestion ) => suggestion.domain_name === domainName );

			if ( ! suggestion ) {
				throw new Error( `Suggestion not found for domain: ${ domainName }` );
			}

			return {
				...suggestion,
				price_rule: getPriceRuleForSuggestion( suggestion ),
			};
		},
	} );

	if ( ! suggestion ) {
		throw new Error( `Suggestion not found for domain: ${ domainName }` );
	}

	return suggestion;
};
