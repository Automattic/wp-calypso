import { __experimentalHStack as HStack } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';
import { Filter } from './filter';
import { FilterState } from './types';

const DELAY_TIMEOUT = 300;

const emptyFilter: FilterState = {
	exactSldMatchesOnly: false,
	tlds: [],
};

export const SearchBar = () => {
	const { __ } = useI18n();
	const { query, setQuery } = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( query );
	const [ filter, setFilter ] = useState( emptyFilter );
	// This is the filter that the user is currently selecting. It is only applied when the popover is closed
	const [ temporaryFilter, setTemporaryFilter ] = useState( emptyFilter );
	// TODO: Hardcoded for testing, should get those from the https://public-api.wordpress.com/rest/v1.1/domains/suggestions/tlds endpoint
	const availableTlds = [ 'com', 'net', 'org', 'blog', 'dev', 'io', 'co', 'co.uk', 'com.br', 'de' ];

	useEffect( () => {
		const timeout = setTimeout( () => {
			setQuery( localQuery );
		}, DELAY_TIMEOUT );

		return () => clearTimeout( timeout );
	}, [ localQuery, setQuery ] );

	const resetFilter = useCallback( () => {
		setFilter( emptyFilter );
		setTemporaryFilter( emptyFilter );
	}, [] );

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
			<Filter
				availableTlds={ availableTlds }
				filter={ filter }
				resetFilter={ resetFilter }
				setFilter={ setFilter }
				setTemporaryFilter={ setTemporaryFilter }
				showTldFilter
				temporaryFilter={ temporaryFilter }
			/>
		</HStack>
	);
};
