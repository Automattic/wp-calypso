import { useMemo } from 'react';
import { MinimumSite } from './site-type';

type SiteForFiltering = Pick< MinimumSite, 'is_deleted' >;

export interface SitesFilterDeletedOptions {
	shouldApplyFilter: boolean;
}

export function useFilterDeletedSites< T extends SiteForFiltering >(
	sites: T[],
	{ shouldApplyFilter = true }: SitesFilterDeletedOptions
) {
	return useMemo( () => {
		if ( shouldApplyFilter ) {
			return sites.filter( ( site ) => ! site.is_deleted );
		}

		return sites;
	}, [ sites, shouldApplyFilter ] );
}
