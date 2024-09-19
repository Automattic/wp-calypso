import { useSitesListSorting } from '@automattic/sites';
import { useSitesSorting } from 'calypso/state/sites/hooks/use-sites-sorting';
import { useSiteExcerptsQuery } from './use-site-excerpts-query';
import type { SiteExcerptData } from '@automattic/sites';

export const useSiteExcerptsSorted = (): SiteExcerptData[] => {
	const { data: allSites = [] } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only
	);
	const { sitesSorting } = useSitesSorting();
	return useSitesListSorting( allSites, sitesSorting );
};
