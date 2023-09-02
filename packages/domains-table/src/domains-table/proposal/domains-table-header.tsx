import { domainsTableColumns as defaultDomainsTableColumns } from '../../domains-table-header/columns';
import { DomainsTableColumn } from '../../domains-table-header/index';
import { useDomainsTable } from './domains-table';

type Props = {
	domainsTableColumns?: DomainsTableColumn[];
};

export const DomainsTableHeader = ( {
	domainsTableColumns = defaultDomainsTableColumns,
}: Props ) => {
	const {
		sortKey,
		sortDirection,
		onSortChange,
		getBulkSelectionStatus,
		changeBulkSelection,
		hideOwnerColumn,
		domainsRequiringAttention,
		canSelectAnyDomains,
	} = useDomainsTable();

	return (
		<DomainsTableHeader
			columns={ domainsTableColumns }
			activeSortKey={ sortKey }
			activeSortDirection={ sortDirection }
			bulkSelectionStatus={ getBulkSelectionStatus() }
			onBulkSelectionChange={ changeBulkSelection }
			onChangeSortOrder={ onSortChange }
			hideOwnerColumn={ hideOwnerColumn }
			domainsRequiringAttention={ domainsRequiringAttention }
			canSelectAnyDomains={ canSelectAnyDomains }
		/>
	);
};
