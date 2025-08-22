import { DomainSuggestionsList, DomainSuggestionItem } from '../../ui';

const PLACEHOLDER_COUNT = 10;

export const SearchResultsPlaceholder = () => {
	return (
		<DomainSuggestionsList>
			{ Array.from( { length: PLACEHOLDER_COUNT } ).map( ( _, index ) => (
				<DomainSuggestionItem.Placeholder key={ index } />
			) ) }
		</DomainSuggestionsList>
	);
};
