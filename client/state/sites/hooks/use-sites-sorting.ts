import { SitesSortOptions, SitesSortKey, SitesSortOrder, isValidSorting } from '@automattic/sites';
import { useCallback } from 'react';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { useAsyncPreference } from 'calypso/state/preferences/use-async-preference';

const SEPARATOR = '-' as const;

type SitesSorting = `${ SitesSortKey }${ typeof SEPARATOR }${ SitesSortOrder }`;

export const ALPHABETICAL_SORTING = {
	sortKey: 'alphabetically',
	sortOrder: 'asc',
} as const;

export const MAGIC_SORTING = {
	sortKey: 'lastInteractedWith',
	sortOrder: 'desc',
} as const;

export const LAST_PUBLISHED_SORTING = {
	sortKey: 'updatedAt',
	sortOrder: 'desc',
} as const;

export const parseSitesSorting = ( serializedSorting: SitesSorting | 'none' ) => {
	const [ sortKey, sortOrder ] = serializedSorting.split( SEPARATOR );

	const sorting = { sortKey, sortOrder };

	if ( ! isValidSorting( sorting ) ) {
		return ALPHABETICAL_SORTING;
	}

	return sorting;
};

export const stringifySitesSorting = ( sorting: Required< SitesSortOptions > ): SitesSorting => {
	return `${ sorting.sortKey }${ SEPARATOR }${ sorting.sortOrder }`;
};

export const useSitesSorting = () => {
	const siteCount = useSelector( getCurrentUserSiteCount );

	const [ sitesSorting, setSitesSorting ] = useAsyncPreference< SitesSorting >( {
		defaultValue: stringifySitesSorting(
			siteCount && siteCount > 6 ? MAGIC_SORTING : ALPHABETICAL_SORTING
		),
		preferenceName: 'sites-sorting',
	} );

	const onSitesSortingChange = useCallback(
		( newSorting: Required< SitesSortOptions > ) => {
			setSitesSorting( stringifySitesSorting( newSorting ) );
		},
		[ setSitesSorting ]
	);

	return {
		hasSitesSortingPreferenceLoaded: sitesSorting !== 'none',
		sitesSorting: parseSitesSorting( sitesSorting ),
		onSitesSortingChange,
	};
};
