import { useSitesListSorting } from '@automattic/sites';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import {
	DataViewsColumn,
	DataViewsState,
	ItemsDataViewsType,
} from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import JetpackLogo from 'calypso/components/jetpack-logo';
import TimeSince from 'calypso/components/time-since';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { SitePlan } from '../../sites-site-plan';
import ActionsField from './dataviews-fields/actions-field';
import SiteField from './dataviews-fields/site-field';
import { SiteInfo } from './interfaces';
import { SiteStats } from './sites-site-stats';
import { SiteStatus } from './sites-site-status';
import { getSitesPagination, mapFieldIdToSortKey } from './utils';
import type { SiteExcerptData } from '@automattic/sites';
import type { SitesSortOptions } from '@automattic/sites/src/use-sites-list-sorting';

type Props = {
	sites: SiteExcerptData[];
	isLoading: boolean;
	dataViewsState: DataViewsState;
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
};

const DotcomSitesDataViews = ( { sites, isLoading, dataViewsState, setDataViewsState }: Props ) => {
	const { __ } = useI18n();
	const userId = useSelector( getCurrentUserId );
	const dispatch = useDispatch();

	//const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( initialDataViewsState );

	const openSitePreviewPane = useCallback(
		( site: SiteExcerptData ) => {
			// Dispatch Site selection
			dispatch( setSelectedSiteId( site.ID || null ) );

			setDataViewsState( ( prevState: DataViewsState ) => ( {
				...prevState,
				selectedItem: site,
				type: 'list',
			} ) );
		},
		[ setDataViewsState, dataViewsState ]
	);

	const { page: sitesViewPage, perPage: sitesViewPerPage, sort: sitesViewSort } = dataViewsState;

	// Sort sites:
	const sortedSites = useSitesListSorting( sites, {
		sortKey: mapFieldIdToSortKey( sitesViewSort.field ),
		sortOrder: sitesViewSort.direction,
	} as SitesSortOptions ) as SiteExcerptData[];

	// Paginate sites:
	const { paginatedSites, totalItems, totalPages } = getSitesPagination(
		sortedSites,
		sitesViewPage,
		sitesViewPerPage
	);

	// Generate DataViews table field-columns
	const fields = useMemo< DataViewsColumn[] >(
		() => [
			{
				id: 'site',
				header: __( 'Site' ),
				getValue: ( { item }: { item: SiteInfo } ) => item.URL,
				render: ( { item }: { item: SiteInfo } ) => {
					return <SiteField site={ item } openSitePreviewPane={ openSitePreviewPane } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'plan',
				header: __( 'Plan' ),
				render: ( { item }: { item: SiteInfo } ) => <SitePlan site={ item } userId={ userId } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'status',
				header: __( 'Status' ),
				render: ( { item }: { item: SiteInfo } ) => <SiteStatus site={ item } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'last-publish',
				header: __( 'Last Publish' ),
				render: ( { item }: { item: SiteInfo } ) =>
					item.options?.updated_at ? <TimeSince date={ item.options.updated_at } /> : '',
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'stats',
				header: (
					<>
						<JetpackLogo size={ 16 } /> { __( 'Stats' ) }
					</>
				),
				render: ( { item }: { item: SiteInfo } ) => <SiteStats site={ item } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'actions',
				header: __( 'Actions' ),
				render: ( { item }: { item: SiteInfo } ) => (
					<ActionsField site={ item } openSitePreviewPane={ openSitePreviewPane } />
				),
				enableHiding: false,
				enableSorting: false,
			},
		],
		[ __, openSitePreviewPane, userId ]
	);

	// Create the itemData packet
	const [ itemsData, setItemsData ] = useState< ItemsDataViewsType< SiteExcerptData > >( {
		items: paginatedSites,
		pagination: {
			totalItems,
			totalPages,
		},
		itemFieldId: 'ID',
		searchLabel: __( 'Search for sites' ),
		fields,
		actions: [],
		setDataViewsState: setDataViewsState,
		dataViewsState: dataViewsState,
	} );

	// Update the itemData packet
	useEffect( () => {
		setItemsData( ( prevState: ItemsDataViewsType< SiteExcerptData > ) => ( {
			...prevState,
			items: sites,
			fields,
			//actions: actions,
			pagination: {
				totalItems,
				totalPages,
			},
			setDataViewsState,
			dataViewsState,
			selectedItem: dataViewsState.selectedItem,
		} ) );
	}, [ fields, dataViewsState, setDataViewsState, sites, totalItems, totalPages ] ); // add actions when implemented

	return <ItemsDataViews data={ itemsData } isLoading={ isLoading } />;
};

export default DotcomSitesDataViews;
