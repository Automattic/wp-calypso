import { useMemo } from 'react';
import { MinimumSite } from './site-type';

type SiteForFiltering = Pick< MinimumSite, 'is_deleted' >;

export interface SitesFilterDeleteOptions {
	shouldApplyFilter: boolean;
}

export function useSitesListFilterDelete< T extends SiteForFiltering >(
	sites: T[],
	{ shouldApplyFilter = true }: SitesFilterDeleteOptions
) {
	return useMemo( () => {
		if ( shouldApplyFilter ) {
			return sites.filter( ( site ) => ! site.is_deleted );
		}

		return sites;
	}, [ sites, shouldApplyFilter ] );
}
