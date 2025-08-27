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
						setExactSldMatchesOnlyInFilter={ setExactSldMatchesOnlyInFilter }
						temporaryFilter={ temporaryFilter }
						availableTlds={ availableTlds }
						onClose={ onClose }
						resetFilter={ resetFilter }
						onClear={ () => {
							onClose();
							resetFilter();
						} }
						validateTld={ validateTld }
						handleTldsChange={ handleTldsChange }
					/>
				);
			} }
			onClose={ () => {
				setFilter( temporaryFilter );
			} }
		/>
	);
};
