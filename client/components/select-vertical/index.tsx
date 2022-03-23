import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { UseQueryOptions } from 'react-query';
import { useDebounce } from 'use-debounce';
import FormLabel from 'calypso/components/forms/form-label';
import { useSiteVerticalsQuery } from 'calypso/data/site-verticals';
import SuggestionSearch from './suggestion-search';
import type { Vertical } from './types';
import type { SiteVerticalsResponse, SiteVerticalsQueryParams } from 'calypso/data/site-verticals';

interface Props {
	isSkipSynonyms?: boolean;
}

const SelectVertical: React.FC< Props > = ( { isSkipSynonyms } ) => {
	const translate = useTranslate();
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 300 );
	const { data: suggestions } = useSiteVerticalsQuery(
		{ term: debouncedSearchTerm, skip_synonyms: isSkipSynonyms } as SiteVerticalsQueryParams,
		{ enabled: '' !== debouncedSearchTerm } as UseQueryOptions
	);

	const mapSiteVerticalsResponseToVertical = useCallback(
		( verticals: SiteVerticalsResponse[] ): Vertical[] =>
			verticals.map( ( vertical: SiteVerticalsResponse ) => ( {
				value: vertical.id,
				label: vertical.title,
				category: String( translate( 'Suggestions' ) ),
			} ) ),
		[ suggestions, translate ]
	);

	return (
		<>
			<FormLabel>{ translate( 'Select a category' ) }</FormLabel>
			<SuggestionSearch
				placeholder={ String( translate( 'Ex. Cafes, Education, Photography' ) ) }
				searchTerm={ searchTerm }
				suggestions={ mapSiteVerticalsResponseToVertical( suggestions || [] ) }
				isLoading={ undefined === suggestions }
				onInputChange={ ( term ) => setSearchTerm( term ) }
			/>
		</>
	);
};

export default SelectVertical;
