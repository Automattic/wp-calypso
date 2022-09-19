import {
	SitesTableSortOptions,
	sitesTableSortKeys,
	SitesTableSortKey,
	sitesTableSortOrders,
	SitesTableSortOrder,
} from '@automattic/components';
import { useAsyncPreference } from 'calypso/state/preferences/use-async-preference';

const SEPARATOR = '-' as const;

type SitesSorting = `${ SitesTableSortKey }${ typeof SEPARATOR }${ SitesTableSortOrder }`;

const DEFAULT_SITES_SORTING = {
	sortKey: 'updatedAt',
	sortOrder: 'desc',
} as const;

export const parseSitesSorting = ( sorting: string ) => {
	if ( -1 === sorting.indexOf( SEPARATOR ) ) {
		return DEFAULT_SITES_SORTING;
	}

	const [ sortKey, sortOrder ] = sorting.split( SEPARATOR );

	if ( ! sitesTableSortKeys.includes( sortKey ) || ! sitesTableSortOrders.includes( sortOrder ) ) {
		return DEFAULT_SITES_SORTING;
	}

	return {
		sortKey: sortKey as SitesTableSortKey,
		sortOrder: sortOrder as SitesTableSortOrder,
	};
};

export const stringifySitesSorting = (
	sorting: Required< SitesTableSortOptions >
): SitesSorting => {
	return `${ sorting.sortKey }${ SEPARATOR }${ sorting.sortOrder }`;
};

export const useSitesSorting = () => {
	const [ sitesSorting, onSitesSortingChange ] = useAsyncPreference< SitesSorting >( {
		defaultValue: stringifySitesSorting( DEFAULT_SITES_SORTING ),
		preferenceName: 'sites-sorting',
	} );

	return {
		hasSitesSortingPreferenceLoaded: sitesSorting !== 'none',
		sitesSorting: parseSitesSorting( sitesSorting ),
		onSitesSortingChange: ( newSorting: Required< SitesTableSortOptions > ) => {
			onSitesSortingChange( stringifySitesSorting( newSorting ) );
		},
	};
};
