import { useQuery } from '@tanstack/react-query';

export interface PublicListItem {
	blog_id: number | null;
	feed_id: number;
	site_name: string;
	site_url: string;
	site_icon: string | null;
	fediverse_handle: string | null;
	fediverse_handle_url: string | null;
}

export interface PublicListResponse {
	ID: number;
	title: string;
	slug: string;
	description: string;
	owner: string;
	item_count: number;
	tags: string[];
	items: PublicListItem[];
}

async function fetchPublicList( owner: string, slug: string ): Promise< PublicListResponse > {
	const response = await globalThis.fetch(
		`https://public-api.wordpress.com/wpcom/v2/read/lists/${ encodeURIComponent(
			owner
		) }/${ encodeURIComponent( slug ) }`
	);

	if ( ! response.ok ) {
		throw new Error( `Failed to fetch list: ${ response.status }` );
	}

	return response.json();
}

export function usePublicListQuery( owner: string, slug: string ) {
	return useQuery( {
		queryKey: [ 'reader', 'public-list', owner, slug ],
		queryFn: () => fetchPublicList( owner, slug ),
		enabled: Boolean( owner ) && Boolean( slug ),
		staleTime: 5 * 60 * 1000, // 5 minutes
	} );
}
