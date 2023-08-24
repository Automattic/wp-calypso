import { useSiteDomainsQuery } from '@automattic/data-stores';
import { useMemo } from 'react';
import { domainsTableColumns } from './domains-table-header/columns';
import { useSortState } from './use-sort-state';
import type { DomainsTableProps } from './domains-table';

export function useSiteDomainsTable(
	siteIdOrSlug: number | string | null | undefined
): DomainsTableProps {
	const [ sorting, setSortState ] = useSortState();
	const { sortKey, sortDirection } = sorting;
	const { data } = useSiteDomainsQuery( siteIdOrSlug );

	const domains = useMemo( () => {
		const selectedColumnDefinition = domainsTableColumns.find(
			( column ) => column.name === sortKey
		);

		return data?.domains.sort( ( first, second ) => {
			let result = 0;

			for ( const sortFunction of selectedColumnDefinition?.sortFunctions || [] ) {
				result = sortFunction( first, second, sortDirection === 'asc' ? 1 : -1 );
				if ( result !== 0 ) {
					break;
				}
			}

			return result;
		} );
	}, [ data, sortKey, sortDirection ] );

	return { domains, sorting, onSortChange: setSortState, isAllSitesView: false };
}
