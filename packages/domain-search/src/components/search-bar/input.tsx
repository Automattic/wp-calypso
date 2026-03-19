import { useDebounce } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';

const DELAY_TIMEOUT = 300;

export const Input = () => {
	const { __ } = useI18n();
	const { query, setQuery, events } = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( query );

	useEffect( () => {
		setLocalQuery( query );
	}, [ query ] );

	const debouncedPropagateQuery = useDebounce( setQuery, DELAY_TIMEOUT );

	return (
		<DomainSearchControls.Input
			value={ localQuery }
			onChange={ ( value ) => {
				const trimmedValue = value.trim();

				setLocalQuery( trimmedValue );

				if ( trimmedValue ) {
					debouncedPropagateQuery( trimmedValue );
				} else {
					events.onQueryClear();
				}
			} }
			label={ __( 'Search for a domain' ) }
		/>
	);
};
