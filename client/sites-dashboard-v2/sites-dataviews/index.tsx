import { __ } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import JetpackLogo from 'calypso/components/jetpack-logo';
import TimeSince from 'calypso/components/time-since';
import { SitePlan } from 'calypso/sites-dashboard/components/sites-site-plan';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import ActionsField from './dataviews-fields/actions-field';
import SiteField from './dataviews-fields/site-field';
import { SiteInfo } from './interfaces';
import { SiteStats } from './sites-site-stats';
import { SiteStatus } from './sites-site-status';
import type { SiteExcerptData } from '@automattic/sites';
import type {
	DataViewsColumn,
	DataViewsPaginationInfo,
	DataViewsState,
	ItemsDataViewsType,
} from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';

import './style.scss';

type Props = {
	sites: SiteExcerptData[];
	isLoading: boolean;
	paginationInfo: DataViewsPaginationInfo;
	dataViewsState: DataViewsState;
	setDataViewsState: ( callback: ( prevState: DataViewsState ) => DataViewsState ) => void;
};

export const siteStatusGroups = [
	{ value: 1, label: __( 'All sites' ), slug: 'all' },
	{ value: 2, label: __( 'Public' ), slug: 'public' },
	{ value: 3, label: __( 'Private' ), slug: 'private' },
	{ value: 4, label: __( 'Coming soon' ), slug: 'coming-soon' },
	{ value: 5, label: __( 'Redirect' ), slug: 'redirect' },
	{ value: 6, label: __( 'Deleted' ), slug: 'deleted' },
];

const DotcomSitesDataViews = ( {
	sites,
	isLoading,
	paginationInfo,
	dataViewsState,
	setDataViewsState,
}: Props ) => {
	const { __ } = useI18n();
	const userId = useSelector( getCurrentUserId );

	const openSitePreviewPane = useCallback(
		( site: SiteExcerptData ) => {
			setDataViewsState( ( prevState: DataViewsState ) => ( {
				...prevState,
				selectedItem: site,
				type: 'list',
			} ) );
		},
		[ setDataViewsState ]
	);

	useEffect( () => {
		// If the user clicks on a row, open the site preview pane by triggering the site button click.
		const handleRowClick = ( event: Event ) => {
			const target = event.target as HTMLElement;
			const row = target.closest(
				'.dataviews-view-table__row, li:has(.dataviews-view-list__item)'
			);
			if ( row ) {
				const isButtonOrLink = target.closest( 'button, a' );
				if ( ! isButtonOrLink ) {
					const button = row.querySelector(
						'.sites-dataviews__preview-trigger'
					) as HTMLButtonElement;
					if ( button ) {
						button.click();
					}
				}
			}
		};

		const rowsContainer = document.querySelector( '.dataviews-view-table, .dataviews-view-list' );
		if ( rowsContainer ) {
			rowsContainer.addEventListener( 'click', handleRowClick as EventListener );
		}

		return () => {
			if ( rowsContainer ) {
				rowsContainer.removeEventListener( 'click', handleRowClick as EventListener );
			}
		};
	}, [] );

	// Generate DataViews table field-columns
	const fields = useMemo< DataViewsColumn[] >(
		() => [
			{
				id: 'site',
				header: <span>{ __( 'Site' ) }</span>,
				getValue: ( { item }: { item: SiteInfo } ) => item.URL,
				render: ( { item }: { item: SiteInfo } ) => {
					return <SiteField site={ item } openSitePreviewPane={ openSitePreviewPane } />;
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'plan',
				header: <span>{ __( 'Plan' ) }</span>,
				render: ( { item }: { item: SiteInfo } ) => <SitePlan site={ item } userId={ userId } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'status',
				header: __( 'Status' ),
				render: ( { item }: { item: SiteInfo } ) => <SiteStatus site={ item } />,
				type: 'enumeration',
				elements: siteStatusGroups,
				filterBy: {
					operators: [ 'in' ],
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'last-publish',
				header: <span>{ __( 'Last Publish' ) }</span>,
				render: ( { item }: { item: SiteInfo } ) =>
					item.options?.updated_at ? <TimeSince date={ item.options.updated_at } /> : '',
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'stats',
				header: (
					<>
						<JetpackLogo size={ 16 } />
						<span>{ __( 'Stats' ) }</span>
					</>
				),
				render: ( { item }: { item: SiteInfo } ) => <SiteStats site={ item } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'actions',
				header: <span>{ __( 'Actions' ) }</span>,
				render: ( { item }: { item: SiteInfo } ) => <ActionsField site={ item } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'magic',
				header: __( 'Magic' ),
				render: () => <></>,
				enableHiding: false,
				enableSorting: true,
			},
		],
		[ __, openSitePreviewPane, userId ]
	);

	// Create the itemData packet state
	const [ itemsData, setItemsData ] = useState< ItemsDataViewsType< SiteExcerptData > >( {
		items: sites,
		itemFieldId: 'ID',
		searchLabel: __( 'Search by name or domain…' ),
		fields,
		actions: [],
		setDataViewsState: setDataViewsState,
		dataViewsState: dataViewsState,
		pagination: paginationInfo,
	} );

	// Update the itemData packet
	useEffect( () => {
		setItemsData( ( prevState: ItemsDataViewsType< SiteExcerptData > ) => ( {
			...prevState,
			items: sites,
			fields,
			// actions: actions,
			setDataViewsState,
			dataViewsState,
			selectedItem: dataViewsState.selectedItem,
			pagination: paginationInfo,
		} ) );
	}, [ fields, dataViewsState, paginationInfo, setDataViewsState, sites ] ); // add actions when implemented

	return (
		<ItemsDataViews
			data={ itemsData }
			isLoading={ isLoading }
			className={ classnames( 'sites-overview__content', 'is-hiding-navigation' ) }
		/>
	);
};

export default DotcomSitesDataViews;
