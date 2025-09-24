import { useDebounce } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';

const DELAY_TIMEOUT = 300;
const SEARCH_EVENT_DELAY_TIMEOUT = 10000;
let searchCount = 0;

export const Input = () => {
	const { __ } = useI18n();
	const { query, setQuery, events, config } = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( query );

	const debouncedPropagateQuery = useDebounce( setQuery, DELAY_TIMEOUT );

	useEffect( () => {
		const searchEventTimeout = setTimeout( () => {
			searchCount++;
			events.onSearch( localQuery, config?.vendor, searchCount );
		}, SEARCH_EVENT_DELAY_TIMEOUT );

		return () => {
			clearTimeout( searchEventTimeout );
		};
	}, [ localQuery, setQuery, events, config ] );

	return (
		<DomainSearchControls.Input
			value={ localQuery }
			onChange={ ( value ) => {
				const trimmedValue = value.trim();

				if ( trimmedValue ) {
					setLocalQuery( trimmedValue );
					debouncedPropagateQuery( trimmedValue );
				}
			} }
			label={ __( 'Search for a domain' ) }
		/>
	);
};
