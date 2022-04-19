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
	onSelect?: ( vertical: Vertical ) => void;
}

const SelectVertical: React.FC< Props > = ( { defaultVertical, isSkipSynonyms, onSelect } ) => {
	const translate = useTranslate();
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 150 );
	const isDebouncing = searchTerm !== debouncedSearchTerm;

	const { data: defaultValue, isLoading: isLoadingDefaultVertical } = useSiteVerticalQueryById(
		defaultVertical || ''
	);

	const { data: suggestions, isLoading: isLoadingSuggestions } = useSiteVerticalsQuery( {
		term: debouncedSearchTerm,
		skip_synonyms: isSkipSynonyms,
	} );

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
			<FormLabel>{ translate( 'Select a category' ) }</FormLabel>
			<SuggestionSearch
				placeholder={ String( translate( 'Ex. Cafe, Education, Photography' ) ) }
				searchTerm={ searchTerm }
				suggestions={
					! isDebouncing
						? mapManySiteVerticalsResponseToVertical(
								( searchTerm === '' ? featured : suggestions ) || []
						  )
						: []
				}
				isLoading={ isDebouncing || isLoadingDefaultVertical || isLoadingSuggestions }
				isDisableInput={ isLoadingDefaultVertical }
				onInputChange={ setSearchTerm }
				onSelect={ onSelect }
			/>
		</>
	);
};

export default SelectVertical;
