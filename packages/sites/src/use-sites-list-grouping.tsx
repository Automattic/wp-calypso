import { useI18n } from '@wordpress/react-i18n';
import { useMemo } from 'react';
import {
	getSiteLaunchStatus,
	siteLaunchStatuses,
	SiteObjectWithStatus,
	useTranslatedSiteLaunchStatuses,
} from './site-status';
import { MinimumSite } from './site-type';

export const DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE = 'all';

export const siteLaunchStatusGroupValues = [
	DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE,
	...siteLaunchStatuses,
] as const;

export type GroupableSiteLaunchStatuses = ( typeof siteLaunchStatusGroupValues )[ number ];

export interface Status {
	title: string;
	name: GroupableSiteLaunchStatuses;
	count: number;
	hiddenCount: number;
}

export interface SitesGroupingOptions {
	showHidden?: boolean;
	status: GroupableSiteLaunchStatuses;
}

type SiteForGrouping = Pick< MinimumSite, keyof SiteObjectWithStatus | 'visible' >;

export const useSitesListGrouping = < T extends SiteForGrouping >(
	allSites: T[],
	{ showHidden = false, status }: SitesGroupingOptions
) => {
	const { __ } = useI18n();
	const translatedSiteLaunchStatuses = useTranslatedSiteLaunchStatuses();

	const groupableSiteLaunchStatuses = useMemo( () => {
		return {
			all: __( 'All sites' ),
			...translatedSiteLaunchStatuses,
		};
	}, [ __, translatedSiteLaunchStatuses ] );

	const [ statuses, groupedByStatus ] = useMemo( () => {
		const statuses: Status[] = siteLaunchStatusGroupValues.map( ( name ) => ( {
			name,
			title: groupableSiteLaunchStatuses[ name ],
			count: 0,
			hiddenCount: 0,
		} ) );

		const hiddenCounts = {
			all: 0,
			'coming-soon': 0,
			public: 0,
			private: 0,
			redirect: 0,
			deleted: 0,
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
			{
				all: showHidden ? allSites : [],
				'coming-soon': [],
				public: [],
				private: [],
				redirect: [],
				deleted: [],
			}
		);

		for ( const status of statuses ) {
			status.count = groupedByStatus[ status.name ].length;
			status.hiddenCount = hiddenCounts[ status.name ];
		}

		return [ statuses, groupedByStatus ];
	}, [ allSites, groupableSiteLaunchStatuses, showHidden ] );

	return { statuses, currentStatusGroup: groupedByStatus[ status ] };
};
