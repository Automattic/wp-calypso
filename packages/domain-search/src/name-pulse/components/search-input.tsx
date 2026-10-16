import { __experimentalHStack as HStack } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';
import { getWordCount, sanitizeDomainInput } from '../helpers';
import { useNamePulseUrlQuery } from '../hooks/use-name-pulse-url-query';
import { NamePulseFilter } from './filter';
import './search-input.scss';

// Off screen, the browser anchors scrolling to the results, so their reload pushes the page down.
const keepNamePulseSearchBarInView = ( searchBar: HTMLElement | null ) => {
	if ( ! searchBar || searchBar.getBoundingClientRect().top >= 0 ) {
		return;
	}

	searchBar.scrollIntoView( { block: 'start' } );
};

export const NamePulseSearchInput = ( { showFilter = false }: { showFilter?: boolean } ) => {
	const { __ } = useI18n();
	const { query, setQuery, events } = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( query );
	const inputRef = useRef< HTMLInputElement >( null );
	const searchBarRef = useRef< HTMLDivElement >( null );

	useNamePulseUrlQuery( query );

	// The page swaps InitialState for NamePulseResults on the first query, which
	// remounts this input; keep the caret where the user left it.
	useEffect( () => {
		const input = inputRef.current;
		input?.focus();
		input?.setSelectionRange( input.value.length, input.value.length );
	}, [] );

	// The query comes back normalised; keep what the user typed unless it changed.
	useEffect( () => {
		setLocalQuery( ( current ) =>
			sanitizeDomainInput( current ) === sanitizeDomainInput( query ) ? current : query
		);
	}, [ query ] );

	return (
		<HStack
			ref={ searchBarRef }
			className="domain-search__search-bar name-pulse-search-input"
			spacing={ 4 }
		>
			<DomainSearchControls.Input
				ref={ inputRef }
				value={ localQuery }
				label={ __( 'Search for a domain' ) }
				onChange={ ( value ) => {
					const trimmedValue = value.trim();

					setLocalQuery( value );

					if ( trimmedValue ) {
						keepNamePulseSearchBarInView( searchBarRef.current );
						setQuery( trimmedValue, 'input_changed' );
					} else {
						if ( query ) {
							events.onNamePulseTracksEvent( 'query_clear', {
								previous_query_length: query.length,
								previous_word_count: getWordCount( query ),
							} );
						}
						events.onQueryClear();
					}
				} }
			/>
			{ showFilter && <NamePulseFilter /> }
		</HStack>
	);
};
