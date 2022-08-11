import { useFuzzySearch } from '@automattic/search';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import { SiteObjectWithStatus, getSiteStatus, siteStatuses } from './site-status';

export const DEFAULT_SITE_STATUS_FILTER_VALUE = 'all';

export const siteStatusFilterValues = [
	DEFAULT_SITE_STATUS_FILTER_VALUE,
	...siteStatuses,
] as const;

export type FilterableSiteStatuses = typeof siteStatusFilterValues[ number ];

interface SitesTableFilterOptions {
	status: FilterableSiteStatuses;
	search?: string;
}

interface Status {
	title: React.ReactChild;
	name: FilterableSiteStatuses;
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
		const statuses = [
			{ name: 'all' as const, title: __( 'All Sites' ), count: 0 },
			{ name: 'public' as const, title: __( 'Public' ), count: 0 },
			{ name: 'private' as const, title: __( 'Private' ), count: 0 },
			{ name: 'coming-soon' as const, title: __( 'Coming Soon' ), count: 0 },
		];

		const groupedByStatus = allSites.reduce< { [ K in Status[ 'name' ] ]: T[] } >(
			( groups, site ) => {
				const siteStatus = getSiteStatus( site );
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
