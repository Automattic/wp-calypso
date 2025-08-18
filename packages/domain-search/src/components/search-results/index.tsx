import { useQuery } from '@tanstack/react-query';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestion, DomainSuggestionPrice, DomainSuggestionsList } from '../../ui';
import { DomainSuggestionCTA } from '../suggestion-cta';

export const SearchResults = () => {
	const { query, queries } = useDomainSearch();
	const { data: suggestions } = useQuery( queries.domainSuggestions( { query } ) );

	return (
		<DomainSuggestionsList>
			{ suggestions?.map( ( suggestion ) => {
				const [ domain, ...tlds ] = suggestion.domain_name.split( '.' );
				return (
					<DomainSuggestion
						key={ suggestion.domain_name }
						domain={ domain }
						tld={ tlds.join( '.' ) }
						price={ <DomainSuggestionPrice price={ suggestion.cost } /> }
						cta={ <DomainSuggestionCTA suggestion={ suggestion } /> }
					/>
				);
			} ) }
		</DomainSuggestionsList>
	);
};
