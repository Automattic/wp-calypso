import { useQuery } from '@tanstack/react-query';
import { Dropdown } from '@wordpress/components';
import { useMemo } from 'react';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';

const POPOVER_PROPS = {
	placement: 'bottom-end',
	offset: 10,
	noArrow: false,
	inline: true,
};

export const Filter = () => {
	const { filter, setFilter, query, queries, resetFilter } = useDomainSearch();
	const { data: availableTlds = [], isFetching: isFetchingTlds } = useQuery( {
		...queries.availableTlds( query ),
		enabled: true,
	} );

	const filterCount = useMemo(
		() => filter.tlds.length + ( filter.exactSldMatchesOnly ? 1 : 0 ),
		[ filter ]
	);

	if ( ! isFetchingTlds && availableTlds.length === 0 ) {
		return null;
	}

	return (
		<Dropdown
			showArrow={ false }
			className="domain-search__search-bar-filters"
			popoverProps={ POPOVER_PROPS }
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
