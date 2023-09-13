import { BulkActionsToolbar } from '../bulk-actions-toolbar/index';
import { DomainsTableFilters } from '../domains-table-filters/index';
import { useDomainsTable } from './domains-table';

import './style.scss';

export function DomainsTableToolbar() {
	const {
		hasSelectedDomains,
		handleAutoRenew,
		handleUpdateContactInfo,
		selectedDomains,
		filter,
		setFilter,
	} = useDomainsTable();

	if ( hasSelectedDomains ) {
		return (
			<BulkActionsToolbar
				onAutoRenew={ handleAutoRenew }
				onUpdateContactInfo={ handleUpdateContactInfo }
				selectedDomainCount={ selectedDomains.size }
			/>
		);
	}
	return (
		<DomainsTableFilters
			onSearch={ ( query ) => setFilter( ( filter ) => ( { ...filter, query } ) ) }
			filter={ filter }
		/>
	);
}
