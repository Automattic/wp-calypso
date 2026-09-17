import { useDebounce, useEvent } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';

const DELAY_TIMEOUT = 300;

export const NamePulseSearchInput = () => {
	const { __ } = useI18n();
	const { query, setQuery, events } = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( query );
	const debouncedSetQuery = useDebounce( useEvent( setQuery ), DELAY_TIMEOUT );

	useEffect( () => {
		setLocalQuery( ( current ) => ( current.trim() === query ? current : query ) );
	}, [ query ] );

	return (
		<div className="domain-search__search-bar">
			<DomainSearchControls.Input
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
