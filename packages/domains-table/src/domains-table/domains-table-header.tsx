import { DomainsTableHeader as InternalDomainsTableHeader } from '../domains-table-header/index';
import { useDomainsTable } from './domains-table';

export const DomainsTableHeader = () => {
	const {
		sortKey,
		sortDirection,
		onSortChange,
		getBulkSelectionStatus,
		changeBulkSelection,
		hideOwnerColumn,
		domainsRequiringAttention,
		canSelectAnyDomains,
		filteredData,
		domainsTableColumns,
		isAllSitesView,
	} = useDomainsTable();

	return (
		<InternalDomainsTableHeader
			columns={ domainsTableColumns }
			activeSortKey={ sortKey }
			activeSortDirection={ sortDirection }
			bulkSelectionStatus={ getBulkSelectionStatus() }
			onBulkSelectionChange={ changeBulkSelection }
			onChangeSortOrder={ onSortChange }
			hideOwnerColumn={ hideOwnerColumn }
			domainsRequiringAttention={ domainsRequiringAttention }
			canSelectAnyDomains={ canSelectAnyDomains }
			domainCount={ filteredData.length }
			isAllSitesView={ isAllSitesView }
		/>
	);
};
