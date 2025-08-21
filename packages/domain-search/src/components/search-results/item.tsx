import { useQuery } from '@tanstack/react-query';
import { useSuggestion } from '../../hooks/use-suggestion';
import { useDomainSuggestionBadges } from '../../hooks/use-suggestion-badges';
import { useDomainSearch } from '../../page/context';
import { DomainSuggestion, DomainSuggestionPrice } from '../../ui';
import { DomainSuggestionCTA } from '../suggestion-cta';

interface SearchResultsItemProps {
	domainName: string;
}

export const SearchResultsItem = ( { domainName }: SearchResultsItemProps ) => {
	const [ domain, ...tlds ] = domainName.split( '.' );
	const { queries } = useDomainSearch();

	const suggestion = useSuggestion( domainName );
	const { data: availability } = useQuery( queries.domainAvailability( domainName ) );
	const suggestionBadges = useDomainSuggestionBadges( domainName );

	return (
		<DomainSuggestion
			badges={ suggestionBadges.length > 0 ? suggestionBadges : undefined }
			domain={ domain }
			tld={ tlds.join( '.' ) }
			price={
				<DomainSuggestionPrice salePrice={ availability?.sale_cost } price={ suggestion.cost } />
			}
			cta={ <DomainSuggestionCTA domainName={ domainName } /> }
		/>
	);
};
