import { useAllManagableDomains } from './use-all-managable-domains';
import { useSortState } from './use-sort-state';
import type { DomainsTableProps } from './domains-table';

export function useAllDomainsTable(): DomainsTableProps {
	const [ sorting, setSortState ] = useSortState();
	const { data: domains } = useAllManagableDomains( {
		sortKey: sorting.sortKey,
		sortOrder: sorting.sortDirection,
	} );

	return { domains, sorting, onSortChange: setSortState, isAllSitesView: true };
}
