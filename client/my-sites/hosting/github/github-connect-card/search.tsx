import { useState } from 'react';
import SuggestionSearch from 'calypso/components/suggestion-search';

interface SearchProps {
	id: string;
	placeholder: string;
	options: string[];
	onSelect( option: string ): void;
	disabled?: boolean;
}

export const Search = ( { id, placeholder, options, onSelect, disabled }: SearchProps ) => {
	const [ query, setQuery ] = useState( '' );

	return (
		<SuggestionSearch
			id={ id }
			placeholder={ placeholder }
			disabled={ disabled }
			showIcon={ false }
			showSuggestionsWithEmptyQuery
			onChange={ ( query: string, selected: boolean ) => {
				setQuery( query );

				if ( selected ) {
					onSelect( query );
				}
			} }
			value={ query }
			suggestions={ options
				.filter( ( repo ) =>
					query.length > 0 ? repo.toLowerCase().includes( query.toLowerCase() ) : true
				)
				.slice( 0, 5 )
				.map( ( repo ) => ( { label: repo } ) ) }
		/>
	);
};
