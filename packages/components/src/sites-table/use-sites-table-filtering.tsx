import { useFuzzySearch } from '@automattic/search';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import {
	SiteObjectWithStatus,
	getSiteLaunchStatus,
	siteLaunchStatuses,
	getTranslatedSiteLaunchStatuses,
} from './site-status';

export const DEFAULT_SITE_LAUNCH_STATUS_FILTER_VALUE = 'all';

export const siteLaunchStatusFilterValues = [
	DEFAULT_SITE_LAUNCH_STATUS_FILTER_VALUE,
	...siteLaunchStatuses,
] as const;

export type FilterableSiteLaunchStatuses = typeof siteLaunchStatusFilterValues[ number ];

interface SitesTableFilterOptions {
	status: FilterableSiteLaunchStatuses;
	search?: string;
}

interface Status {
	title: React.ReactChild;
	name: FilterableSiteLaunchStatuses;
	count: number;
}

interface UseSitesTableFilteringResult< T > {
	filteredSites: T[];
	statuses: Status[];
}

type SiteObjectWithBasicInfo = SiteObjectWithStatus & {
	URL: string;
	name: string;
	slug: string;
};

export function useSitesTableFiltering< T extends SiteObjectWithBasicInfo >(
	allSites: T[],
	{ status, search }: SitesTableFilterOptions
): UseSitesTableFilteringResult< T > {
	const { __ } = useI18n();

	const [ statuses, groupedByStatus ] = useMemo( () => {
		const translatedLaunchStatuses = {
			all: __( 'All Sites' ),
			...getTranslatedSiteLaunchStatuses( __ ),
		};

		const statuses: Status[] = siteLaunchStatusFilterValues.map( ( name ) => ( {
			name,
			title: translatedLaunchStatuses[ name ],
			count: 0,
		} ) );

		const groupedByStatus = allSites.reduce< { [ K in Status[ 'name' ] ]: T[] } >(
			( groups, site ) => {
				const siteStatus = getSiteLaunchStatus( site );
				groups[ siteStatus ].push( site );

				return groups;
			},
			{ all: allSites, 'coming-soon': [], public: [], private: [] }
		);

		for ( const status of statuses ) {
			status.count = groupedByStatus[ status.name ].length;
		}

		return [ statuses, groupedByStatus ];
	}, [ allSites, __ ] );

	const filteredSites = useFuzzySearch( {
		data: groupedByStatus[ status ],
		keys: [ 'URL', 'name', 'slug' ],
		query: search,
	} );

	return { filteredSites, statuses };
}
