import { SitesSortOptions, SitesSortKey, SitesSortOrder, isValidSorting } from '@automattic/sites';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { useAsyncPreference } from 'calypso/state/preferences/use-async-preference';

const SEPARATOR = '-' as const;

type SitesSorting = `${ SitesSortKey }${ typeof SEPARATOR }${ SitesSortOrder }`;

const ALPHABETICAL_SORTING = {
	sortKey: 'alphabetically',
	sortOrder: 'asc',
} as const;

const MAGIC_SORTING = {
	sortKey: 'lastInteractedWith',
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
	const siteCount = useSelector( ( state ) => getCurrentUserSiteCount( state ) );

	const [ sitesSorting, onSitesSortingChange ] = useAsyncPreference< SitesSorting >( {
		defaultValue: stringifySitesSorting(
			siteCount && siteCount > 6 ? MAGIC_SORTING : ALPHABETICAL_SORTING
		),
		preferenceName: 'sites-sorting',
	} );

	return {
		hasSitesSortingPreferenceLoaded: sitesSorting !== 'none',
		sitesSorting: parseSitesSorting( sitesSorting ),
		onSitesSortingChange: ( newSorting: Required< SitesSortOptions > ) => {
			onSitesSortingChange( stringifySitesSorting( newSorting ) );
		},
	};
};
