import { __experimentalHStack as HStack } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';
import { Filter } from './filter';

const DELAY_TIMEOUT = 300;

export const SearchBar = () => {
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
		<HStack spacing={ 4 }>
			<DomainSearchControls.Input
				value={ localQuery }
				onChange={ ( value ) => {
					const trimmedValue = value.trim();

					if ( trimmedValue ) {
						setLocalQuery( trimmedValue );
					}
				} }
				label={ __( 'Search for a domain' ) }
				// eslint-disable-next-line jsx-a11y/no-autofocus
				autoFocus={ false }
				minLength={ 1 }
				maxLength={ 253 }
				dir="ltr"
				onBlur={ () => {} }
				onKeyDown={ () => {} }
			/>
			<Filter />
		</HStack>
	);
};
