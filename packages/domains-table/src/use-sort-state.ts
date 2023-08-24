import { useCallback, useState } from 'react';
import { DomainsTableColumn } from './domains-table-header';
import type { AllDomainsQueryParams } from '@automattic/data-stores';

export interface Sorting {
	sortKey: Exclude< AllDomainsQueryParams[ 'sortKey' ], undefined >;
	sortDirection: 'asc' | 'desc';
}

export function useSortState() {
	const [ sortState, innerSetSortState ] = useState< Sorting >( {
		sortKey: 'domain',
		sortDirection: 'asc',
	} );

	const setSortState = useCallback( ( selectedColumn: DomainsTableColumn ) => {
		if ( ! selectedColumn.isSortable ) {
			return;
		}

		innerSetSortState( ( { sortKey, sortDirection } ) => {
			const newSortDirection =
				selectedColumn.name === sortKey &&
				selectedColumn.supportsOrderSwitching &&
				sortDirection === 'asc'
					? 'desc'
					: selectedColumn.initialSortDirection;

			return {
				sortKey: selectedColumn.name,
				sortDirection: newSortDirection,
			};
		} );
	}, [] );

	return [ sortState, setSortState ] as const;
}
