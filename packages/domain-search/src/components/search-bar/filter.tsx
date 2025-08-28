import { Dropdown } from '@wordpress/components';
import { useCallback, useMemo, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';
import { FilterState } from './types';
import type { TokenItem } from '@wordpress/components/build-types/form-token-field/types';

const emptyFilter: FilterState = {
	exactSldMatchesOnly: false,
	tlds: [],
};

type Props = {
	onSubmit?: () => void;
	showTldFilter: boolean;
};

export const Filter = ( { onSubmit, showTldFilter }: Props ) => {
	const { filter, setFilter } = useDomainSearch();
	// This is the filter that the user is currently selecting. It is only applied when the popover is closed
	const [ temporaryFilter, setTemporaryFilter ] = useState( emptyFilter );
	// TODO: Hardcoded for testing, should get those from the https://public-api.wordpress.com/rest/v1.1/domains/suggestions/tlds endpoint
	const availableTlds = useMemo(
		() => [ 'com', 'net', 'org', 'blog', 'dev', 'io', 'co', 'co.uk', 'com.br', 'de' ],
		[]
	);

	const resetFilter = useCallback( () => {
		setFilter( emptyFilter );
		setTemporaryFilter( emptyFilter );
	}, [ setFilter ] );

	const getFiltercounts = useCallback( () => {
		return filter.tlds.length + ( filter.exactSldMatchesOnly ? 1 : 0 );
	}, [ filter ] );

	const setTldsInFilter = useCallback(
		( tlds: string[] ) => {
			setTemporaryFilter( {
				...temporaryFilter,
				tlds,
			} );
		},
		[ setTemporaryFilter, temporaryFilter ]
	);

	const addTldToFilter = ( tld: string ) => {
		if ( tld.startsWith( '.' ) ) {
			tld = tld.slice( 1 );
		}

		setTemporaryFilter( {
			...temporaryFilter,
			tlds: [ ...temporaryFilter.tlds, tld ],
		} );
	};

	const setExactSldMatchesOnlyInFilter = useCallback(
		( exactSldMatchesOnly: boolean ) => {
			setTemporaryFilter( {
				...temporaryFilter,
				exactSldMatchesOnly,
			} );
		},
		[ setTemporaryFilter, temporaryFilter ]
	);

	// Only add TLD to current selection if it exists in the available TLDs list
	const validateTld = ( tld: string ) => {
		return availableTlds.includes( tld );
	};

	const handleTldsChange = ( tokens: ( string | TokenItem )[] ) => {
		const tlds = tokens.map( ( token ) => ( typeof token === 'string' ? token : token.value ) );
		setTldsInFilter( tlds );
	};

	const getRecommendedTlds = useCallback( () => {
		return availableTlds.slice( 0, 5 ).filter( ( tld ) => ! temporaryFilter.tlds.includes( tld ) );
	}, [ availableTlds, temporaryFilter.tlds ] );

	const getExploreMoreTlds = useCallback( () => {
		return availableTlds
			.slice( 5 )
			.sort()
			.filter( ( tld ) => ! temporaryFilter.tlds.includes( tld ) );
	}, [ availableTlds, temporaryFilter.tlds ] );

	return (
		<Dropdown
			showArrow={ false }
			popoverProps={ { placement: 'bottom-end', offset: 10, noArrow: false } }
			renderToggle={ ( { onToggle } ) => {
				return (
					<DomainSearchControls.FilterButton count={ getFiltercounts() } onClick={ onToggle } />
				);
			} }
			renderContent={ ( { onClose } ) => {
				return (
					<DomainSearchControls.FilterPopover
						addTldToFilter={ addTldToFilter }
						availableTlds={ availableTlds }
						exploreMoreTlds={ getExploreMoreTlds() }
						handleTldsChange={ handleTldsChange }
						onClear={ () => {
							onClose();
							resetFilter();
						} }
						onClose={ onClose }
						recommendedTlds={ getRecommendedTlds() }
						setExactSldMatchesOnlyInFilter={ setExactSldMatchesOnlyInFilter }
						showTldFilter={ showTldFilter }
						temporaryFilter={ temporaryFilter }
						validateTld={ validateTld }
					/>
				);
			} }
			onClose={ () => {
				setFilter( temporaryFilter );
				onSubmit?.();
			} }
		/>
	);
};
