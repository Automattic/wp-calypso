import { useQuery } from '@tanstack/react-query';
import { useDomainSearch } from '../page/context';

export const useSuggestion = ( domainName: string ) => {
	const { query, queries, filter } = useDomainSearch();

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
				// TODO: Replace with actual logic from the isPaidDomain function
				is_paid_domain: true,
			};
		},
	} );

	if ( ! suggestion ) {
		throw new Error( `Suggestion not found for domain: ${ domainName }` );
	}

	return suggestion;
};
