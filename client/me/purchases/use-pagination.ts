import { useMemo } from 'react';

interface PaginationResult< PaginationItem > {
	paginatedItems: PaginationItem[];
	totalPages: number;
	totalItems: number;
	currentPage: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

function calculatePagination< PaginationItem >(
	items: PaginationItem[],
	page: number,
	perPage: number
): PaginationResult< PaginationItem > {
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

export function usePagination< PaginationItem >(
	items: PaginationItem[],
	page: number,
	perPage: number
): PaginationResult< PaginationItem > {
	return useMemo( () => calculatePagination( items, page, perPage ), [ items, page, perPage ] );
}
