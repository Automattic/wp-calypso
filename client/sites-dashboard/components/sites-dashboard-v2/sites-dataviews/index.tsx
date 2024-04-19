import { Button } from '@automattic/components';
import { useSitesListSorting } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initialDataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import {
	DataViewsColumn,
	DataViewsState,
	ItemsDataViewsType,
} from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import TimeSince from 'calypso/components/time-since';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { SitePlan } from '../../sites-site-plan';
import { SiteActions } from './sites-site-actions';
import { SiteStats } from './sites-site-stats';
import { SiteStatus } from './sites-site-status';
import { getSitesPagination, mapFieldIdToSortKey } from './utils';
import type { SiteExcerptData } from '@automattic/sites';
import type { SitesSortOptions } from '@automattic/sites/src/use-sites-list-sorting';

import './style.scss';

interface SitesDataViewsSite {
	item: SiteExcerptData;
}

type Props = {
	sites: SiteExcerptData[];
	isLoading: boolean;
};

const DotcomSitesDataViews = ( { sites, isLoading }: Props ) => {
	const { __ } = useI18n();
	const userId = useSelector( getCurrentUserId );

	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( initialDataViewsState );

	const openSitePreviewPane = useCallback(
		( site: SiteExcerptData ) => {
			setDataViewsState( ( prevState: DataViewsState ) => ( {
				...prevState,
				selectedItem: site,
				type: 'list',
			} ) );
		},
		[ setDataViewsState, dataViewsState ]
	);

	const { page: sitesViewPage, perPage: sitesViewPerPage, sort: sitesViewSort } = dataViewsState;

	const sortedSites = useSitesListSorting( sites, {
		sortKey: mapFieldIdToSortKey( sitesViewSort.field ),
		sortOrder: sitesViewSort.direction,
	} as SitesSortOptions ) as SiteExcerptData[];

	const { paginatedSites, totalItems, totalPages } = getSitesPagination(
		sortedSites,
		sitesViewPage,
		sitesViewPerPage
	);

	/*const dispatch = useDispatch();
	useEffect( () => {
		dispatch( setSelectedSiteId( selectedSiteId || null ) );
	}, [ dispatch, selectedSiteId ] );*/

	const fields = useMemo< DataViewsColumn[] >(
		() => [
			{
				id: 'site',
				header: __( 'Site' ),
				getValue: ( { item }: SitesDataViewsSite ) => item.URL,
				render: ( { item }: SitesDataViewsSite ) => {
					return (
						<Button
							onClick={ () => {
								openSitePreviewPane( item );
							} }
						>
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
				render: ( { item }: SitesDataViewsSite ) =>
					item.options?.updated_at ? <TimeSince date={ item.options.updated_at } /> : '',
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'stats',
				// todo: Use the Stats header component
				header: __( 'Stats' ),
				render: ( { item }: SitesDataViewsSite ) => <SiteStats site={ item } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'actions',
				header: __( 'Actions' ),
				render: ( { item }: SitesDataViewsSite ) => <SiteActions site={ item } />,
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ __, openSitePreviewPane, userId ]
	);

	const dotcomSitesDataViews: ItemsDataViewsType< SiteExcerptData > = {
		items: paginatedSites,
		pagination: {
			totalItems,
			totalPages,
		},
		fields,
		setDataViewsState,
		dataViewsState,
	};

	return <ItemsDataViews data={ dotcomSitesDataViews } isLoading={ isLoading } />;
};

export default DotcomSitesDataViews;
