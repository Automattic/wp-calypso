import SuggestionSearch from 'calypso/components/suggestion-search';

interface SearchProps {
	id: string;
	className?: string;
	placeholder: string;
	options: string[];
	onSelect( option: string ): void;
	onChange?( query: string, selected: boolean ): void;
	disabled?: boolean;
	onReset(): void;
	query: string;
}

export const Search = ( {
	id,
	className,
	placeholder,
	options,
	onSelect,
	onReset,
	onChange,
	disabled,
	query,
}: SearchProps ) => {
	return (
		<SuggestionSearch
			id={ id }
			className={ className }
			placeholder={ placeholder }
			disabled={ disabled }
			showIcon={ false }
			showSuggestionsWithEmptyQuery
			onChange={ ( query: string, selected: boolean ) => {
				if ( selected ) {
					return onSelect( query );
				}

				onChange?.( query, selected );
			} }
			onReset={ onReset }
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
