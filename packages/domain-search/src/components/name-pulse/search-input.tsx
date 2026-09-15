import { useDebounce } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';

export const NAME_PULSE_DEBOUNCE_MS = 300;

/**
 * Keystroke search bar for the results page. Unlike the classic `SearchBar`
 * input it keeps the raw value locally (so spaces between words survive) and
 * propagates the trimmed query after a 300 ms debounce. No TLD filter: Name
 * Pulse sections have their own fixed ordering.
 */
export const NamePulseSearchInput = () => {
	const { __ } = useI18n();
	const { query, setQuery, events } = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( query );

	useEffect( () => {
		setLocalQuery( ( current ) => ( current.trim() === query ? current : query ) );
	}, [ query ] );

	const debouncedPropagateQuery = useDebounce( setQuery, NAME_PULSE_DEBOUNCE_MS );

	return (
		<div className="domain-search__search-bar">
			<DomainSearchControls.Input
				value={ localQuery }
				onChange={ ( value ) => {
					setLocalQuery( value );

					const trimmedValue = value.trim();
					if ( trimmedValue ) {
						debouncedPropagateQuery( trimmedValue );
					} else {
						debouncedPropagateQuery.cancel();
						events.onQueryClear();
					}
				} }
				label={ __( 'Search for a domain' ) }
			/>
		</div>
	);
};
