import { useDebounce, useEvent } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';
import './search-input.scss';

const DELAY_TIMEOUT = 300;

export const NamePulseSearchInput = () => {
	const { __ } = useI18n();
	const { query, setQuery, events } = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( query );
	const debouncedSetQuery = useDebounce( useEvent( setQuery ), DELAY_TIMEOUT );
	const inputRef = useRef< HTMLInputElement >( null );

	// The page swaps InitialState for NamePulseResults on the first query, which
	// remounts this input; keep the caret where the user left it.
	useEffect( () => {
		const input = inputRef.current;
		input?.focus();
		input?.setSelectionRange( input.value.length, input.value.length );
	}, [] );

	useEffect( () => {
		setLocalQuery( ( current ) =>
			current.trim().toLowerCase() === query.toLowerCase() ? current : query
		);
	}, [ query ] );

	return (
		<div className="domain-search__search-bar name-pulse-search-input">
			<DomainSearchControls.Input
				ref={ inputRef }
				value={ localQuery }
				label={ __( 'Search for a domain' ) }
				onChange={ ( value ) => {
					const trimmedValue = value.trim();

					setLocalQuery( value );

					if ( trimmedValue ) {
						debouncedSetQuery( trimmedValue );
					} else {
						debouncedSetQuery.cancel();
						events.onQueryClear();
					}
				} }
			/>
		</div>
	);
};
