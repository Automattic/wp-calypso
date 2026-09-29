import { useQuery } from '@tanstack/react-query';
import { Dropdown } from '@wordpress/components';
import { useDomainSearch } from '../../page/context';
import { DomainSearchControls } from '../../ui';

const POPOVER_PROPS = {
	placement: 'bottom-end',
	offset: 10,
	noArrow: false,
	inline: true,
};

const NO_TLDS: string[] = [];

/**
 * The classic filter button and popover, fed by the Name Pulse TLD list. Only
 * endings are offered: the exact-match grid is already exact.
 */
export const NamePulseFilter = () => {
	const { filter, setFilter, resetFilter, queries } = useDomainSearch();
	const { data: tlds = NO_TLDS, isPending } = useQuery( queries.namePulseTlds() );

	if ( ! isPending && tlds.length === 0 ) {
		return null;
	}

	return (
		<Dropdown
			showArrow={ false }
			className="domain-search__search-bar-filters name-pulse-filter"
			popoverProps={ POPOVER_PROPS }
			renderToggle={ ( { onToggle } ) => (
				<DomainSearchControls.FilterButton
					count={ filter.tlds.length }
					onClick={ onToggle }
					disabled={ isPending }
				/>
			) }
			renderContent={ ( { onClose } ) => (
				<DomainSearchControls.FilterPopover
					availableTlds={ tlds }
					filter={ filter }
					showExactMatchesOnly={ false }
					onClear={ () => {
						resetFilter();
						onClose();
					} }
					onApply={ ( newFilter ) => {
						setFilter( newFilter );
						onClose();
					} }
				/>
			) }
		/>
	);
};
