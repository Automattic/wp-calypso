import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';

const DELAY_TIMEOUT = 300;

export const Input = () => {
	const { __ } = useI18n();
	const { query, setQuery } = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( query );

	useEffect( () => {
		const timeout = setTimeout( () => {
			setQuery( localQuery );
		}, DELAY_TIMEOUT );

		return () => clearTimeout( timeout );
	}, [ localQuery, setQuery ] );
	return (
		<DomainSearchControls.Input
			value={ localQuery }
			onChange={ ( value ) => {
				const trimmedValue = value.trim();

				if ( trimmedValue ) {
					setLocalQuery( trimmedValue );
				}
			} }
			label={ __( 'Search for a domain' ) }
		/>
	);
};
