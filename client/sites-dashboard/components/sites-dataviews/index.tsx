import { Button } from '@automattic/components';
import { useSitesListSorting } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import { useContext } from 'react';
import {
	JetpackSitesDashboard,
	JetpackSitesDashboardContext,
} from 'calypso/components/jetpack-sites-dashboard';
import TimeSince from 'calypso/components/time-since';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { SitePlan } from '../sites-site-plan';
import { SiteStats } from '../sites-site-stats';
import { SiteStatus } from '../sites-site-status';
import { getSitesPagination, mapFieldIdToSortKey } from './utils';
import type { SiteExcerptData } from '@automattic/sites';
import type { SitesSortOptions } from '@automattic/sites/src/use-sites-list-sorting';

interface SitesDataViewsSite {
	item: SiteExcerptData;
}

interface SitesDataViewsProps {
	sites: SiteExcerptData[];
}

const SitesDataViews = ( { sites }: SitesDataViewsProps ) => {
	const { __ } = useI18n();
	const userId = useSelector( getCurrentUserId );

	const { openSitePreviewPane, sitesViewState } = useContext( JetpackSitesDashboardContext );
	const { page: sitesViewPage, perPage: sitesViewPerPage, sort: sitesViewSort } = sitesViewState;

	const sortedSites = useSitesListSorting( sites, {
		sortKey: mapFieldIdToSortKey( sitesViewSort.field ),
		sortOrder: sitesViewSort.direction,
	} as SitesSortOptions ) as SiteExcerptData[];

	const { paginatedSites, totalItems, totalPages } = getSitesPagination(
		sortedSites,
		sitesViewPage,
		sitesViewPerPage
	);

	const fields = [
		{
			id: 'site',
			header: __( 'Site' ),
			getValue: ( { item }: SitesDataViewsSite ) => item.URL,
			render: ( { item }: SitesDataViewsSite ) => {
				return (
					<Button onClick={ () => openSitePreviewPane( item.ID ) }>
						<div className="sites-dataviews__site-name">{ item.title }</div>
					</Button>
				);
			},
			enableHiding: false,
			enableSorting: true,
		},
		{
			id: 'plan',
			header: __( 'Plan' ),
			render: ( { item }: SitesDataViewsSite ) => <SitePlan site={ item } userId={ userId } />,
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'status',
			header: __( 'Status' ),
			render: ( { item }: SitesDataViewsSite ) => <SiteStatus site={ item } />,
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'last-publish',
			header: __( 'Last Publish' ),
			getValue: ( { item }: SitesDataViewsSite ) =>
				item.options?.updated_at ? <TimeSince date={ item.options.updated_at } /> : '',
			enableHiding: false,
			enableSorting: true,
		},
		{
			id: 'stats',
			header: __( 'Stats' ),
			render: ( { item }: SitesDataViewsSite ) => <SiteStats site={ item } />,
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'actions',
			header: __( 'Actions' ),
			getValue: () => '-',
			enableHiding: false,
			enableSorting: false,
		},
	];

	return (
		<JetpackSitesDashboard
			data={ paginatedSites }
			fields={ fields }
			paginationInfo={ { totalItems, totalPages } }
		/>
	);
};

export default SitesDataViews;
