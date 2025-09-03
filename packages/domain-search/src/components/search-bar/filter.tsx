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
	const { filter, setFilter } = useDomainSearch();

	// TODO: Hardcoded for testing, should get those from the https://public-api.wordpress.com/rest/v1.1/domains/suggestions/tlds endpoint
	const availableTlds = useMemo(
		() => [ 'com', 'net', 'org', 'blog', 'dev', 'io', 'co', 'co.uk', 'com.br', 'de' ],
		[]
	);

	const resetFilter = useCallback( () => {
		setFilter( emptyFilter );
	}, [ setFilter ] );

	const filterCount = useMemo(
		() => filter.tlds.length + ( filter.exactSldMatchesOnly ? 1 : 0 ),
		[ filter ]
	);

	return (
		<Dropdown
			showArrow={ false }
			popoverProps={ { placement: 'bottom-end', offset: 10, noArrow: false, inline: true } }
			renderToggle={ ( { onToggle } ) => {
				return <DomainSearchControls.FilterButton count={ filterCount } onClick={ onToggle } />;
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
