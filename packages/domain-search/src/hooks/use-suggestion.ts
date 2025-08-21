import { useQuery } from '@tanstack/react-query';
import { useDomainSearch } from '../page/context';

export const useSuggestion = ( domainName: string ) => {
	const { query, queries } = useDomainSearch();

	const { data: suggestion } = useQuery( {
		...queries.domainSuggestions( query ),
		select: ( data ) => {
			const suggestion = data.find( ( suggestion ) => suggestion.domain_name === domainName );

			if ( ! suggestion ) {
				throw new Error( `Suggestion not found for domain: ${ domainName }` );
			}

			return {
				...suggestion,
				// TODO: Replace with actual logic
				is_paid_domain: suggestion.domain_name === 'example.org',
			};
		},
	} );

	if ( ! suggestion ) {
		throw new Error( `Suggestion not found for domain: ${ domainName }` );
	}

	return suggestion;
};
