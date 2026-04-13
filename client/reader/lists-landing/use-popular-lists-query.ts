import { useQuery } from '@tanstack/react-query';

export interface PopularListSummary {
	ID: number;
	title: string;
	slug: string;
	description: string;
	owner: string;
	subscriber_count: number;
	item_count: number;
	tags: string[];
}

interface PopularListsResponse {
	lists: PopularListSummary[];
}

async function fetchPopularLists(): Promise< PopularListsResponse > {
	const response = await globalThis.fetch(
		'https://public-api.wordpress.com/wpcom/v2/read/lists/popular'
	);

	if ( ! response.ok ) {
		throw new Error( `Failed to fetch popular lists: ${ response.status }` );
	}

	return response.json();
}

export function usePopularListsQuery() {
	return useQuery( {
		queryKey: [ 'reader', 'popular-lists' ],
		queryFn: fetchPopularLists,
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );
}
