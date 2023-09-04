import { BulkActionsToolbar } from '../bulk-actions-toolbar/index';
import { DomainsTableFilters } from '../domains-table-filters/index';
import { useDomainsTable } from './domains-table';
import { DomainsTableBulkUpdateIndicator } from './domains-table-bulk-update-progress';

import './style.scss';

export function DomainsTableToolbar() {
	const { hasSelectedDomains, handleAutoRenew, selectedDomains, filter, setFilter, jobs } =
		useDomainsTable();

	const bulkUpdateIndicator = <DomainsTableBulkUpdateIndicator jobs={ jobs } />;

	if ( hasSelectedDomains ) {
		return (
			<BulkActionsToolbar
				onAutoRenew={ handleAutoRenew }
				selectedDomainCount={ selectedDomains.size }
				children={ bulkUpdateIndicator }
			/>
		);
	}
	return (
		<DomainsTableFilters
			onSearch={ ( query ) => setFilter( ( filter ) => ( { ...filter, query } ) ) }
			filter={ filter }
			children={ bulkUpdateIndicator }
		/>
	);
}
