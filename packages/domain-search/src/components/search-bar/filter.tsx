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
						temporaryFilter={ temporaryFilter }
						setTemporaryFilter={ setTemporaryFilter }
						availableTlds={ availableTlds }
						onClose={ onClose }
						resetFilter={ resetFilter }
					/>
				);
			} }
			onClose={ () => {
				setFilter( temporaryFilter );
			} }
		/>
	);
};
