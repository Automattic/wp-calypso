import { useDebounce, useEvent } from '@wordpress/compose';
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

	// `useDebounce` cancels the pending call whenever the callback identity
	// changes, and the context rebuilds `setQuery` on every cart update. Give
	// it a stable callback so a cart response landing mid-delay doesn't drop
	// the typed query.
	const propagateQuery = useEvent( setQuery );
	const debouncedPropagateQuery = useDebounce( propagateQuery, DELAY_TIMEOUT );

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
