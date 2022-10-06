import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import FormLabel from 'calypso/components/forms/form-label';
import {
	useSiteVerticalQueryById,
	useSiteVerticalsQuery,
	useSiteVerticalsFeatured,
} from 'calypso/data/site-verticals';
import SuggestionSearch from './suggestion-search';
import type { Vertical } from './types';
import type { SiteVerticalsResponse } from 'calypso/data/site-verticals';

interface Props {
	defaultVertical?: string;
	isSkipSynonyms?: boolean;
	/** Use to randomize the featured verticals */
	seed?: string;
	onInputChange?: ( searchTerm: string ) => void;
	onSelect?: ( vertical: Vertical ) => void;
}

const SelectVertical: React.FC< Props > = ( {
	defaultVertical,
	isSkipSynonyms,
	seed,
	onInputChange,
	onSelect,
} ) => {
	const translate = useTranslate();
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ hasUserInput, setHasUserInput ] = useState( false );
	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 150 );
	const isDebouncing = searchTerm !== debouncedSearchTerm;

	const { data: defaultValue, isLoading: isLoadingDefaultVertical } = useSiteVerticalQueryById(
		defaultVertical || ''
	);

	const { data: suggestions, isLoading: isLoadingSuggestions } = useSiteVerticalsQuery( {
		term: debouncedSearchTerm,
		skip_synonyms: isSkipSynonyms,
	} );

	const { data: featured } = useSiteVerticalsFeatured( seed );

	const mapOneSiteVerticalsResponseToVertical = ( vertical: SiteVerticalsResponse ): Vertical => ( {
		value: vertical.id,
		label: vertical.title,
		name: vertical.name,
		category: String( translate( 'Suggestions' ) ),
		has_vertical_images: !! vertical.has_vertical_images,
	} );

	const mapManySiteVerticalsResponseToVertical = (
		verticals: SiteVerticalsResponse[]
	): Vertical[] =>
		verticals.map( ( vertical: SiteVerticalsResponse ) =>
			mapOneSiteVerticalsResponseToVertical( vertical )
		);

	useEffect( () => {
		if ( defaultValue ) {
			const suggestion = mapOneSiteVerticalsResponseToVertical( defaultValue );
			setSearchTerm( suggestion.label );
			onSelect?.( suggestion );
		}
	}, [ defaultValue ] );

	return (
		<>
			<FormLabel>{ translate( 'Search for a category' ) }</FormLabel>
			<SuggestionSearch
				placeholder={ String( translate( 'Ex. Cafe, Education, Photography' ) ) }
				searchTerm={ searchTerm }
				suggestions={
					! isDebouncing
						? mapManySiteVerticalsResponseToVertical(
								( ! hasUserInput ? featured : suggestions ) || []
						  )
						: []
				}
				isLoading={ isDebouncing || isLoadingDefaultVertical || isLoadingSuggestions }
				isDisableInput={ isLoadingDefaultVertical }
				onInputChange={ ( searchTerm: string ) => {
					setHasUserInput( searchTerm !== '' );
					setSearchTerm( searchTerm );
					onInputChange?.( searchTerm );
				} }
				onSelect={ ( vertical: Vertical ) => {
					setHasUserInput( false );
					setSearchTerm( vertical.label );
					onSelect?.( vertical );
				} }
			/>
		</>
	);
};

export default SelectVertical;
