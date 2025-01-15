import { useMemo } from 'react';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

interface PaginationResult {
	paginatedItems: BillingTransaction[];
	totalPages: number;
	totalItems: number;
	currentPage: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

function calculatePagination(
	items: BillingTransaction[],
	page: number,
	perPage: number
): PaginationResult {
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
}

export function usePagination(
	items: BillingTransaction[],
	page: number,
	perPage: number
): PaginationResult {
	return useMemo( () => calculatePagination( items, page, perPage ), [ items, page, perPage ] );
}
