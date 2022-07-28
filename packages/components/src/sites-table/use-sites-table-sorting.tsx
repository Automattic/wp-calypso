// eslint-disable-next-line no-restricted-imports
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

interface SitesTableSortOptions {
	sort?: string;
	order?: 'asc' | 'desc';
}

interface UseSitesTableSortingResult {
	sortedSites: SiteExcerptData[];
}

export function useSitesTableSorting(
	allSites: SiteExcerptData[],
	{ sort, order = 'asc' }: SitesTableSortOptions
): UseSitesTableSortingResult {
	switch ( sort ) {
		case 'updated-at':
			return { sortedSites: sortSitesByLastPublish( allSites, order ) };
		default:
			return { sortedSites: allSites };
	}
}

function sortSitesByLastPublish( sites: SiteExcerptData[], order: string ): SiteExcerptData[] {
	return sites.sort( ( a, b ) => {
		if ( ! a.options?.updated_at || ! b.options?.updated_at ) {
			return 0;
		}

		if ( a.options.updated_at > b.options.updated_at ) {
			return order === 'asc' ? 1 : -1;
		}

		if ( a.options.updated_at < b.options.updated_at ) {
			return order === 'asc' ? -1 : 1;
		}

		return 0;
	} );
}
