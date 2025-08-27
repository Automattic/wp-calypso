import { Dropdown } from '@wordpress/components';
import { useCallback } from 'react';
import { DomainSearchControls } from '../../ui';
import { FilterState } from './types';
import type { TokenItem } from '@wordpress/components/build-types/form-token-field/types';

type Props = {
	availableTlds: string[];
	filter: FilterState;
	onSubmit?: () => void;
	resetFilter: () => void;
	setFilter: ( filter: FilterState ) => void;
	setTemporaryFilter: ( filter: FilterState ) => void;
	showTldFilter: boolean;
	temporaryFilter: FilterState;
};

export const Filter = ( {
	availableTlds,
	filter,
	onSubmit,
	resetFilter,
	setFilter,
	setTemporaryFilter,
	showTldFilter,
	temporaryFilter,
}: Props ) => {
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
