import { useMemo } from 'react';
import { MinimumSite } from './site-type';

type SiteForFiltering = Pick< MinimumSite, 'is_deleted' >;

export interface SitesDefaultFilterOptions {
	search?: string;
	statusSlug?: string;
}

export function useSitesListDefaultFiltering< T extends SiteForFiltering >(
	sites: T[],
	{ search, statusSlug }: SitesDefaultFilterOptions
) {
	return useMemo( () => {
		if ( ! search && ( ! statusSlug || statusSlug === 'all' ) ) {
			return sites.filter( ( site ) => ! site.is_deleted );
		}

		return sites;
	}, [ sites, search, statusSlug ] );
}
