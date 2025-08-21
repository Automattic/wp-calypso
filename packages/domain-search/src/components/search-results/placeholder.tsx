import { DomainSuggestionsList, DomainSuggestion } from '../../ui';

const PLACEHOLDER_COUNT = 10;

export const SearchResultsPlaceholder = () => {
	return (
		<DomainSuggestionsList>
			{ Array.from( { length: PLACEHOLDER_COUNT } ).map( ( _, index ) => (
				<DomainSuggestion.Placeholder key={ index } />
			) ) }
		</DomainSuggestionsList>
	);
};
