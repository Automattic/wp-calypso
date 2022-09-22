import {
	SitesTableSortOptions,
	SitesTableSortKey,
	SitesTableSortOrder,
	isValidSorting,
} from '@automattic/components';
import { useAsyncPreference } from 'calypso/state/preferences/use-async-preference';

const SEPARATOR = '-' as const;

type SitesSorting = `${ SitesTableSortKey }${ typeof SEPARATOR }${ SitesTableSortOrder }`;

const DEFAULT_SITES_SORTING = {
	sortKey: 'updatedAt',
	sortOrder: 'desc',
} as const;

export const parseSitesSorting = ( serializedSorting: SitesSorting | 'none' ) => {
	const [ sortKey, sortOrder ] = serializedSorting.split( SEPARATOR );

	const sorting = { sortKey, sortOrder };

	if ( ! isValidSorting( sorting ) ) {
		return DEFAULT_SITES_SORTING;
	}

	return sorting;
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
