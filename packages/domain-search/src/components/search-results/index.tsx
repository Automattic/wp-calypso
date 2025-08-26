import { DomainSuggestionsList } from '../../ui';
import { SearchResultsItem } from './item';
import { SearchResultsPlaceholder } from './placeholder';

const SearchResults = ( { suggestions }: { suggestions: string[] } ) => {
	return (
		<DomainSuggestionsList>
			{ suggestions?.map( ( suggestion ) => (
				<SearchResultsItem key={ suggestion } domainName={ suggestion } />
			) ) }
		</DomainSuggestionsList>
	);
};

SearchResults.Placeholder = SearchResultsPlaceholder;

export { SearchResults };
