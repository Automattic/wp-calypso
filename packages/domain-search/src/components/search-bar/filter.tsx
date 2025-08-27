import { Dropdown } from '@wordpress/components';
import { useCallback } from 'react';
import { DomainSearchControls } from '../../ui';
import { FilterState } from './types';

interface FilterProps {
	filter: FilterState;
	temporaryFilter: FilterState;
	setTemporaryFilter: ( filter: FilterState ) => void;
	availableTlds: string[];
	resetFilter: () => void;
	setFilter: ( filter: FilterState ) => void;
}

export const Filter = ( {
	filter,
	temporaryFilter,
	setTemporaryFilter,
	availableTlds,
	resetFilter,
	setFilter,
}: FilterProps ) => {
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
						resetFilter={ resetFilter }
						setExactSldMatchesOnlyInFilter={ setExactSldMatchesOnlyInFilter }
						temporaryFilter={ temporaryFilter }
						validateTld={ validateTld }
					/>
				);
			} }
			onClose={ () => {
				setFilter( temporaryFilter );
			} }
		/>
	);
};
