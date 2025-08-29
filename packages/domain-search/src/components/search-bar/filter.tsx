import { Dropdown } from '@wordpress/components';
import { useCallback, useMemo, useState } from 'react';
import { useDomainSearch } from '../../page/context';
import { FilterState } from '../../page/types';
import { DomainSearchControls } from '../../ui';

const emptyFilter: FilterState = {
	exactSldMatchesOnly: false,
	tlds: [],
};

type Props = {
	onSubmit?: () => void;
};

export const Filter = ( { onSubmit }: Props ) => {
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

	const getFilterCount = useCallback(
		() => filter.tlds.length + ( filter.exactSldMatchesOnly ? 1 : 0 ),
		[ filter ]
	);

	return (
		<Dropdown
			showArrow={ false }
			popoverProps={ { placement: 'bottom-end', offset: 10, noArrow: false } }
			renderToggle={ ( { onToggle } ) => {
				return (
					<DomainSearchControls.FilterButton count={ getFilterCount() } onClick={ onToggle } />
				);
			} }
			renderContent={ ( { onClose } ) => {
				return (
					<DomainSearchControls.FilterPopover
						availableTlds={ availableTlds }
						onClear={ () => {
							onClose();
							resetFilter();
						} }
						onClose={ onClose }
						setTemporaryFilter={ setTemporaryFilter }
						temporaryFilter={ temporaryFilter }
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
