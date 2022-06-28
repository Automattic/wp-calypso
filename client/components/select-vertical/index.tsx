import { useTranslate } from 'i18n-calypso';
import { useEffect, useState, useMemo } from 'react';
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
	onInputChange?: ( searchTerm: string ) => void;
	onSelect?: ( vertical: Vertical ) => void;
}

const SelectVertical: React.FC< Props > = ( {
	defaultVertical,
	isSkipSynonyms,
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

	const suggestionsWithRoots = useMemo( () => {
		const rootsAdded: { [ index: string ]: SiteVerticalsResponse } = {};
		return suggestions?.reduce(
			( suggestionsList: SiteVerticalsResponse[], vertical: SiteVerticalsResponse ) => {
				if ( vertical.root && ! rootsAdded[ vertical.root.id ] ) {
					rootsAdded[ vertical.root.id ] = vertical.root;
					suggestionsList.push( vertical.root );
				}
				suggestionsList.push( vertical );

				return suggestionsList;
			},
			[]
		);
	}, [ suggestions ] );

	const { data: featured } = useSiteVerticalsFeatured();

	const mapOneSiteVerticalsResponseToVertical = ( vertical: SiteVerticalsResponse ): Vertical => ( {
		value: vertical.id,
		label: vertical.title,
		category: String( translate( 'Suggestions' ) ),
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
								( ! hasUserInput ? featured : suggestionsWithRoots ) || []
						  )
						: []
				}
				isLoading={ isDebouncing || isLoadingDefaultVertical || isLoadingSuggestions }
				isShowSkipOption={ hasUserInput }
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
