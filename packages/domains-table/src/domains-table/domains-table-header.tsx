import { DomainsTableHeader as InternalDomainsTableHeader } from '../domains-table-header/index';
import { useDomainsTable } from './domains-table';

export const DomainsTableHeader = () => {
	const {
		sortKey,
		sortDirection,
		onSortChange,
		getBulkSelectionStatus,
		changeBulkSelection,
		domainsRequiringAttention,
		canSelectAnyDomains,
		filteredData,
		domainsTableColumns,
		selectedDomains,
		isLoadingDomains,
	} = useDomainsTable();

	return (
		<InternalDomainsTableHeader
			columns={ domainsTableColumns }
			activeSortKey={ sortKey }
			activeSortDirection={ sortDirection }
			bulkSelectionStatus={ getBulkSelectionStatus() }
			onBulkSelectionChange={ changeBulkSelection }
			onChangeSortOrder={ onSortChange }
			domainsRequiringAttention={ domainsRequiringAttention }
			canSelectAnyDomains={ canSelectAnyDomains }
			domainCount={ filteredData.length }
			selectedDomainsCount={ selectedDomains.size }
			isLoadingDomains={ isLoadingDomains }
		/>
	);
};
