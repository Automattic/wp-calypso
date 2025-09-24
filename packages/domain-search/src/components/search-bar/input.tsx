import { useDebounce } from '@wordpress/compose';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useMemo, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';

const DELAY_TIMEOUT = 300;
const SEARCH_EVENT_DELAY_TIMEOUT = 10000;
let searchCount = 0;

const getNewRailcarId = () => {
	const randomId = crypto.randomUUID().replace( /-/g, '' );
	return `${ randomId }-domain-suggestion`;
};

export const Input = () => {
	const { __ } = useI18n();
	const { query, setQuery, events, config, setRailCarId } = useDomainSearch();
	const [ localQuery, setLocalQuery ] = useState( query );

	const debouncedPropagateQuery = useDebounce( setQuery, DELAY_TIMEOUT );

	// We generate a new railcar ID for each search
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const railcarId = useMemo( () => getNewRailcarId(), [ localQuery ] );

	useEffect( () => {
		const timeout = setTimeout( () => {
			setRailCarId( railcarId );
		}, DELAY_TIMEOUT );
		return () => {
			clearTimeout( timeout );
		};
	}, [ localQuery, setRailCarId, railcarId ] );

	useEffect( () => {
		const searchEventTimeout = setTimeout( () => {
			searchCount++;
			events.onSearch( localQuery, config?.vendor, searchCount );
		}, SEARCH_EVENT_DELAY_TIMEOUT );

		return () => {
			clearTimeout( searchEventTimeout );
		};
	}, [ localQuery, setQuery, events, config, setRailCarId, railcarId ] );

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
