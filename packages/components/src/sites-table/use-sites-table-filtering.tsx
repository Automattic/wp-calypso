import { useFuzzySearch } from '@automattic/search';
import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import {
	SiteObjectWithStatus,
	getSiteLaunchStatus,
	siteLaunchStatuses,
	useTranslatedSiteLaunchStatuses,
} from './site-status';

export const DEFAULT_SITE_LAUNCH_STATUS_FILTER_VALUE = 'all';

export const siteLaunchStatusFilterValues = [
	DEFAULT_SITE_LAUNCH_STATUS_FILTER_VALUE,
	...siteLaunchStatuses,
] as const;

export type FilterableSiteLaunchStatuses = typeof siteLaunchStatusFilterValues[ number ];

interface SitesTableFilterOptions {
	search?: string;
	showHidden?: boolean;
	status: FilterableSiteLaunchStatuses;
}

interface Status {
	title: React.ReactChild;
	name: FilterableSiteLaunchStatuses;
	count: number;
	hiddenCount: number;
}

interface UseSitesTableFilteringResult< T > {
	filteredSites: T[];
	statuses: Status[];
}

type SiteObjectWithBasicInfo = SiteObjectWithStatus & {
	URL: string;
	name: string | undefined;
	slug: string;
	visible?: boolean;
};

export function useSitesTableFiltering< T extends SiteObjectWithBasicInfo >(
	allSites: T[],
	{ status, showHidden = false, search }: SitesTableFilterOptions
): UseSitesTableFilteringResult< T > {
	const { __ } = useI18n();
	const translatedSiteLaunchStatuses = useTranslatedSiteLaunchStatuses();

	const filterableSiteLaunchStatuses = useMemo( () => {
		return {
			all: __( 'All sites' ),
			...translatedSiteLaunchStatuses,
		};
	}, [ __, translatedSiteLaunchStatuses ] );

	const [ statuses, groupedByStatus ] = useMemo( () => {
		const statuses: Status[] = siteLaunchStatusFilterValues.map( ( name ) => ( {
			name,
			title: filterableSiteLaunchStatuses[ name ],
			count: 0,
			hiddenCount: 0,
		} ) );

		const hiddenCounts = {
			all: 0,
			'coming-soon': 0,
			public: 0,
			private: 0,
			redirect: 0,
		};

		const groupedByStatus = allSites.reduce< { [ K in Status[ 'name' ] ]: T[] } >(
			( groups, site ) => {
				const siteStatus = getSiteLaunchStatus( site );

				if ( ! site.visible && ! showHidden ) {
					hiddenCounts.all++;
					hiddenCounts[ siteStatus ]++;
				}
				if ( site.visible || showHidden ) {
					groups[ siteStatus ].push( site );
				}
				if ( site.visible && ! showHidden ) {
					groups.all.push( site );
				}

				return groups;
			},
			{ all: showHidden ? allSites : [], 'coming-soon': [], public: [], private: [], redirect: [] }
		);

		for ( const status of statuses ) {
			status.count = groupedByStatus[ status.name ].length;
			status.hiddenCount = hiddenCounts[ status.name ];
		}

		return [ statuses, groupedByStatus ];
	}, [ allSites, filterableSiteLaunchStatuses, showHidden ] );

	const filteredSites = useFuzzySearch( {
		data: groupedByStatus[ status ],
		keys: [ 'URL', 'name', 'slug' ],
		query: search,
	} );

	return { filteredSites, statuses };
}
