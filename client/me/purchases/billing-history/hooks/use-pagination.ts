import { useMemo } from 'react';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

export function usePagination( items: BillingTransaction[], page: number, perPage: number ) {
	return useMemo( () => {
		const startIndex = ( page - 1 ) * perPage;
		const paginatedItems = items.slice( startIndex, startIndex + perPage );
		const totalItems = items.length;
		const totalPages = Math.ceil( totalItems / perPage );

		return {
			paginatedItems,
			totalPages,
			totalItems,
			currentPage: page,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
		};
	}, [ items, page, perPage ] );
}
