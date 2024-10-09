import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ItemsDataViews from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews';
import JetpackLogo from 'calypso/components/jetpack-logo';
import TimeSince from 'calypso/components/time-since';
import { SitePlan } from 'calypso/sites-dashboard/components/sites-site-plan';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import ActionsField from './dataviews-fields/actions-field';
import SiteField from './dataviews-fields/site-field';
import { SiteStats } from './sites-site-stats';
import { SiteStatus } from './sites-site-status';
import type { SiteExcerptData } from '@automattic/sites';
import type { Field } from '@wordpress/dataviews';
import type {
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

export function useSiteStatusGroups() {
	const { __ } = useI18n();

	return useMemo(
		() => [
			{ value: 1, label: __( 'All sites' ), slug: 'all' },
			{ value: 2, label: __( 'Public' ), slug: 'public' },
			{ value: 3, label: __( 'Private' ), slug: 'private' },
			{ value: 4, label: __( 'Coming soon' ), slug: 'coming-soon' },
			{ value: 5, label: __( 'Redirect' ), slug: 'redirect' },
			{ value: 6, label: __( 'Deleted' ), slug: 'deleted' },
		],
		[ __ ]
	);
}

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

	// By default, DataViews is in an "uncontrolled" mode, meaning the current selection is handled internally.
	// However, each time a site is selected, the URL changes, so, the component is remounted and the current selection is lost.
	// To prevent that, we want to use DataViews in "controlled" mode, so that we can pass an initial selection during initial mount.
	//
	// To do that, we need to pass a required `onSelectionChange` callback to signal that it is being used in controlled mode.
	// However, when don't need to do anything in the callback, because we already maintain dataViewsState.selectedItem.
	// The current selection is a derived value which is [dataViewsState.selectedItem.ID].
	// (See the `getSelection()` function below.)
	const onSelectionChange = () => {};
	const getSelection = ( dataViewsState: DataViewsState ) =>
		dataViewsState.selectedItem ? [ dataViewsState.selectedItem.ID ] : undefined;

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

	const siteStatusGroups = useSiteStatusGroups();

	// Generate DataViews table field-columns
	const fields = useMemo< Field< SiteExcerptData >[] >(
		() => [
			{
				id: 'site',
				label: __( 'Site' ),
				header: <span>{ __( 'Site' ) }</span>,
				getValue: ( { item }: { item: SiteExcerptData } ) => item.URL,
				render: ( { item }: { item: SiteExcerptData } ) => {
					return <SiteField site={ item } openSitePreviewPane={ openSitePreviewPane } />;
				},
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'plan',
				label: __( 'Plan' ),
				header: <span>{ __( 'Plan' ) }</span>,
				render: ( { item }: { item: SiteExcerptData } ) => (
					<SitePlan site={ item } userId={ userId } />
				),
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'status',
				label: __( 'Status' ),
				render: ( { item }: { item: SiteExcerptData } ) => <SiteStatus site={ item } />,
				enableHiding: false,
				enableSorting: true,
				elements: siteStatusGroups,
				filterBy: {
					operators: [ 'is' ],
				},
			},
			{
				id: 'last-publish',
				label: __( 'Last Published' ),
				header: <span>{ __( 'Last Published' ) }</span>,
				render: ( { item }: { item: SiteExcerptData } ) =>
					item.options?.updated_at ? <TimeSince date={ item.options.updated_at } /> : '',
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: 'stats',
				label: __( 'Stats' ),
				header: (
					<span className="sites-dataviews__stats-label">
						<JetpackLogo size={ 16 } />
						<span>{ __( 'Stats' ) }</span>
					</span>
				),
				render: ( { item }: { item: SiteExcerptData } ) => <SiteStats site={ item } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'actions',
				label: __( 'Actions' ),
				header: <span>{ __( 'Actions' ) }</span>,
				render: ( { item }: { item: SiteExcerptData } ) => <ActionsField site={ item } />,
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'last-interacted',
				label: __( 'Last Interacted' ),
				render: () => null,
				enableHiding: false,
				enableSorting: true,
				getValue: () => null,
			},
		],
		[ __, openSitePreviewPane, userId, dataViewsState, setDataViewsState, siteStatusGroups ]
	);

	const siteSearchLabel = __( 'Search sites…' );

	// Create the itemData packet state
	const [ itemsData, setItemsData ] = useState< ItemsDataViewsType< SiteExcerptData > >( {
		items: sites,
		itemFieldId: 'ID',
		searchLabel: siteSearchLabel,
		fields,
		actions: [],
		setDataViewsState: setDataViewsState,
		dataViewsState: dataViewsState,
		onSelectionChange,
		pagination: paginationInfo,
		defaultLayouts: { table: {} },
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
			searchLabel: siteSearchLabel,
			selectedItem: dataViewsState.selectedItem,
			selection: getSelection( dataViewsState ),
			pagination: paginationInfo,
		} ) );
	}, [ fields, dataViewsState, paginationInfo, setDataViewsState, sites, siteSearchLabel ] ); // add actions when implemented

	return (
		<ItemsDataViews
			data={ itemsData }
			isLoading={ isLoading }
			className="sites-overview__content"
		/>
	);
};

export default DotcomSitesDataViews;
