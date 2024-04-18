import type { SiteExcerptData } from '@automattic/sites';

const SORT_KEY_MAP = {
	site: 'alphabetically',
	'last-publish': 'updatedAt',
};

export function mapFieldIdToSortKey( fieldId: string ) {
	return SORT_KEY_MAP[ fieldId as keyof typeof SORT_KEY_MAP ] ?? fieldId;
}

export function getSitesPagination( allSites: SiteExcerptData[], page: number, perPage: number ) {
	const paginatedSites = allSites.slice( ( page - 1 ) * perPage, page * perPage );
	const totalItems = allSites.length;
	const totalPages = Math.ceil( totalItems / perPage );

	return { paginatedSites, totalItems, totalPages };
}
