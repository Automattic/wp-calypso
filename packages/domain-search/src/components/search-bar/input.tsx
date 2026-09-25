import { useDebounce } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';

const DELAY_TIMEOUT = 300;

export const Input = () => {
	const { __ } = useI18n();
	const { query, setQuery, events } = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( query );

	const propagateQuery = useCallback(
		( value: string ) => setQuery( value, 'input_changed' ),
		[ setQuery ]
	);
	const debouncedPropagateQuery = useDebounce( propagateQuery, DELAY_TIMEOUT );

	// An external query change (e.g. a suggestion click) supersedes whatever
	// was typed but not yet propagated.
	useEffect( () => {
		debouncedPropagateQuery.cancel();
		setLocalQuery( query );
	}, [ query, debouncedPropagateQuery ] );

	return (
		<DomainSearchControls.Input
			value={ localQuery }
			onChange={ ( value ) => {
				const trimmedValue = value.trim();

				setLocalQuery( trimmedValue );

				if ( trimmedValue ) {
					debouncedPropagateQuery( trimmedValue );
				} else {
					debouncedPropagateQuery.cancel();
					events.onQueryClear();
				}
			} }
			onKeyDown={ ( event ) => {
				if ( event.key === 'Enter' ) {
					debouncedPropagateQuery.flush();
				}
			} }
			label={ __( 'Search for a domain' ) }
		/>
	);
};
