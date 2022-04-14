import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import FormLabel from 'calypso/components/forms/form-label';
import { useSiteVerticalsQuery } from 'calypso/data/site-verticals';
import SuggestionSearch from './suggestion-search';
import type { Vertical } from './types';
import type { SiteVerticalsResponse } from 'calypso/data/site-verticals';

interface Props {
	isSkipSynonyms?: boolean;
	onSelect?: ( vertical: Vertical ) => void;
}

const SelectVertical: React.FC< Props > = ( { isSkipSynonyms, onSelect } ) => {
	const translate = useTranslate();
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 300 );
	const { data: suggestions } = useSiteVerticalsQuery(
		{ term: debouncedSearchTerm, skip_synonyms: isSkipSynonyms },
		{ enabled: '' !== debouncedSearchTerm }
	);

	const mapSiteVerticalsResponseToVertical = ( verticals: SiteVerticalsResponse[] ): Vertical[] =>
		verticals.map( ( vertical: SiteVerticalsResponse ) => ( {
			value: vertical.id,
			label: vertical.title,
			category: String( translate( 'Suggestions' ) ),
		} ) );

	return (
		<>
			<FormLabel>{ translate( 'Select a category' ) }</FormLabel>
			<SuggestionSearch
				placeholder={ String( translate( 'Ex. Cafe, Education, Photography' ) ) }
				searchTerm={ searchTerm }
				suggestions={ mapSiteVerticalsResponseToVertical( suggestions || [] ) }
				isLoading={ undefined === suggestions }
				onInputChange={ setSearchTerm }
				onSelect={ onSelect }
			/>
		</>
	);
};

export default SelectVertical;
