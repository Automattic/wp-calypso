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
import { getSitesPagination, mapFieldIdToSortKey } from './utils';

const SitesDataViews = ( props ) => {
	const { __ } = useI18n();
	const userId = useSelector( getCurrentUserId );

	const { openSitePreviewPane, sitesViewState } = useContext( JetpackSitesDashboardContext );
	const { page: sitesViewPage, perPage: sitesViewPerPage, sort: sitesViewSort } = sitesViewState;

	const sortedSites = useSitesListSorting( props.sites, {
		sortKey: mapFieldIdToSortKey( sitesViewSort.field ),
		sortOrder: sitesViewSort.direction,
	} );

	const { paginatedSites, totalItems, totalPages } = getSitesPagination(
		sortedSites,
		sitesViewPage,
		sitesViewPerPage
	);

	const fields = [
		{
			id: 'site',
			header: __( 'Site' ),
			getValue: ( { item } ) => item.URL,
			render: ( { item } ) => {
				const site = item.ID;
				return (
					<Button onClick={ () => openSitePreviewPane( site ) }>
						<>{ item.title }</>
					</Button>
				);
			},
			enableHiding: false,
			enableSorting: true,
		},
		{
			id: 'plan',
			header: __( 'Plan' ),
			render: ( { item } ) => <SitePlan site={ item } userId={ userId } />,
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'status',
			header: __( 'Status' ),
			getValue: () => '-',
			enableHiding: false,
			enableSorting: false,
		},
		{
			id: 'last-publish',
			header: __( 'Last Publish' ),
			getValue: ( { item } ) =>
				item.options?.updated_at ? <TimeSince date={ item.options.updated_at } /> : '',
			enableHiding: false,
			enableSorting: true,
		},
		{
			id: 'stats',
			header: __( 'Stats' ),
			getValue: () => '-',
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
