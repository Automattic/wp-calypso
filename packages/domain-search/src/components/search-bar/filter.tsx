import { useQuery } from '@tanstack/react-query';
import { Dropdown } from '@wordpress/components';
import { useCallback, useMemo } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';
import { FilterState } from './types';

const emptyFilter: FilterState = {
	exactSldMatchesOnly: false,
	tlds: [],
};

export const Filter = () => {
	const { filter, setFilter, query, queries } = useDomainSearch();
	const { data: availableTlds = [], isFetching: isFetchingTlds } = useQuery( {
		...queries.availableTlds( query ),
		enabled: true,
	} ) as { data: string[]; isFetching: boolean };

	const resetFilter = useCallback( () => {
		setFilter( emptyFilter );
	}, [ setFilter ] );

	const filterCount = useMemo(
		() => filter.tlds.length + ( filter.exactSldMatchesOnly ? 1 : 0 ),
		[ filter ]
	);

	if ( ! isFetchingTlds && ( ! availableTlds || availableTlds.length === 0 ) ) {
		return null;
	}

	return (
		<Dropdown
			showArrow={ false }
			popoverProps={ { placement: 'bottom-end', offset: 10, noArrow: false, inline: true } }
			renderToggle={ ( { onToggle } ) => {
				return (
					<DomainSearchControls.FilterButton
						count={ filterCount }
						onClick={ onToggle }
						disabled={ isFetchingTlds }
					/>
				);
			} }
			renderContent={ ( { onClose } ) => {
				return (
					<DomainSearchControls.FilterPopover
						availableTlds={ availableTlds }
						onClear={ () => {
							resetFilter();
							onClose();
						} }
						filter={ filter }
						onApply={ ( newFilter ) => {
							setFilter( newFilter );
							onClose();
						} }
					/>
				);
			} }
		/>
	);
};
