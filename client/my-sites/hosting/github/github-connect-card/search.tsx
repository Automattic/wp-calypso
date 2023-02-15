import { useState } from 'react';
import SuggestionSearch from 'calypso/components/suggestion-search';

interface SearchProps {
	id: string;
	className?: string;
	placeholder: string;
	options: string[];
	onSelect( option: string ): void;
	onChange?( query: string, selected: boolean ): void;
	disabled?: boolean;
}

export const Search = ( {
	id,
	className,
	placeholder,
	options,
	onSelect,
	onChange,
	disabled,
}: SearchProps ) => {
	const [ query, setQuery ] = useState( '' );

	return (
		<SuggestionSearch
			id={ id }
			className={ className }
			placeholder={ placeholder }
			disabled={ disabled }
			showIcon={ false }
			showSuggestionsWithEmptyQuery
			onChange={ ( query: string, selected: boolean ) => {
				setQuery( query );

				if ( selected ) {
					onSelect( query );
				}
				onChange?.( query, selected );
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
