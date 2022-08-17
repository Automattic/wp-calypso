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

type SitesByVisibility< T > = {
	visible: T[];
	hidden: T[];
};

interface SitesTableFilterOptions {
	search?: string;
	status: FilterableSiteLaunchStatuses;
}

interface Status {
	title: React.ReactChild;
	name: FilterableSiteLaunchStatuses;
	visibleCount: number;
	hiddenCount: number;
}

interface UseSitesTableFilteringResult< T > {
	filteredSites: SitesByVisibility< T >;
	statuses: Status[];
}

type SiteObjectWithBasicInfo = SiteObjectWithStatus & {
	URL: string;
	name: string;
	slug: string;
	visible?: boolean;
};

export function useSitesTableFiltering< T extends SiteObjectWithBasicInfo >(
	allSites: T[],
	{ status, search }: SitesTableFilterOptions
): UseSitesTableFilteringResult< T > {
	const { __ } = useI18n();
	const translatedSiteLaunchStatuses = useTranslatedSiteLaunchStatuses();

	const filterableSiteLaunchStatuses = useMemo( () => {
		return {
			all: __( 'All Sites' ),
			...translatedSiteLaunchStatuses,
		};
	}, [ __, translatedSiteLaunchStatuses ] );

	const [ statuses, groupedByStatus ] = useMemo( () => {
		const groupedByStatus = allSites.reduce< {
			[ K in Status[ 'name' ] ]: SitesByVisibility< T >;
		} >(
			( groups, site ) => {
				const siteStatus = getSiteLaunchStatus( site );

				const groupToAdd = site.visible ? 'visible' : 'hidden';

				groups.all[ groupToAdd ].push( site );
				groups[ siteStatus ][ groupToAdd ].push( site );

				return groups;
			},
			{
				all: { visible: [], hidden: [] },
				'coming-soon': { visible: [], hidden: [] },
				public: { visible: [], hidden: [] },
				private: { visible: [], hidden: [] },
			}
		);

		const statuses: Status[] = siteLaunchStatusFilterValues.map( ( name ) => ( {
			name,
			title: filterableSiteLaunchStatuses[ name ],
			visibleCount: groupedByStatus[ name ].visible.length,
			hiddenCount: groupedByStatus[ name ].hidden.length,
		} ) );

		return [ statuses, groupedByStatus ];
	}, [ allSites, filterableSiteLaunchStatuses ] );

	return {
		filteredSites: {
			visible: useFuzzySearch( {
				data: groupedByStatus[ status ].visible,
				keys: [ 'URL', 'name', 'slug' ],
				query: search,
			} ),
			hidden: useFuzzySearch( {
				data: groupedByStatus[ status ].hidden,
				keys: [ 'URL', 'name', 'slug' ],
				query: search,
			} ),
		},
		statuses,
	};
}
