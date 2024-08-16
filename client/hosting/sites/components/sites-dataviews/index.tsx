import { DESKTOP_BREAKPOINT, WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
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
import { SiteSort } from './sites-site-sort';
import { SiteStats } from './sites-site-stats';
import { SiteStatus } from './sites-site-status';
import { addDummyDataViewPrefix } from './utils';
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
	const isWide = useBreakpoint( WIDE_BREAKPOINT );
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );
	const getSiteNameColWidth = ( isDesktop: boolean, isWide: boolean ) => {
		if ( isWide ) {
			return '40%';
		}
		if ( isDesktop ) {
			return '50%';
		}
		return '70%';
	};

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

	const siteStatusGroups = useSiteStatusGroups();

	// Generate DataViews table field-columns
	const fields = useMemo< Field< SiteExcerptData >[] >(
		() => [
			{
				id: 'site',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
					<SiteSort
						isSortable
						columnKey="site"
						dataViewsState={ dataViewsState }
						setDataViewsState={ setDataViewsState }
					>
						<span>{ __( 'Site' ) }</span>
					</SiteSort>
				),
				width: getSiteNameColWidth( isDesktop, isWide ),
				getValue: ( { item }: { item: SiteExcerptData } ) => item.URL,
				render: ( { item }: { item: SiteExcerptData } ) => {
					return <SiteField site={ item } openSitePreviewPane={ openSitePreviewPane } />;
				},
				enableHiding: false,
				enableSorting: false,
			},
			{
				id: 'plan',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: <span>{ __( 'Plan' ) }</span>,
				render: ( { item }: { item: SiteExcerptData } ) => (
					<SitePlan site={ item } userId={ userId } />
				),
				enableHiding: false,
				enableSorting: false,
				width: '100px',
			},
			{
				id: 'status',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: <span>{ __( 'Status' ) }</span>,
				render: ( { item }: { item: SiteExcerptData } ) => <SiteStatus site={ item } />,
				enableHiding: false,
				enableSorting: false,
				width: '116px',
			},
			{
				id: 'last-publish',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
					<SiteSort
						isSortable
						columnKey="last-publish"
						dataViewsState={ dataViewsState }
						setDataViewsState={ setDataViewsState }
					>
						<span>{ __( 'Last Published' ) }</span>
					</SiteSort>
				),
				render: ( { item }: { item: SiteExcerptData } ) =>
					item.options?.updated_at ? <TimeSince date={ item.options.updated_at } /> : '',
				enableHiding: false,
				enableSorting: false,
				width: '120px',
			},
			{
				id: 'stats',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: (
					<>
						<JetpackLogo size={ 16 } />
						<span>{ __( 'Stats' ) }</span>
					</>
				),
				render: ( { item }: { item: SiteExcerptData } ) => <SiteStats site={ item } />,
				enableHiding: false,
				enableSorting: false,
				width: '80px',
			},
			{
				id: 'actions',
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: <span>{ __( 'Actions' ) }</span>,
				render: ( { item }: { item: SiteExcerptData } ) => <ActionsField site={ item } />,
				enableHiding: false,
				enableSorting: false,
				width: '48px',
			},
			// Dummy fields to allow people to sort by them on mobile.
			{
				id: addDummyDataViewPrefix( 'site' ),
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: <span>{ __( 'Site' ) }</span>,
				render: () => null,
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: addDummyDataViewPrefix( 'last-publish' ),
				// @ts-expect-error -- Need to fix the label type upstream in @wordpress/dataviews to support React elements.
				label: <span>{ __( 'Last Published' ) }</span>,
				render: () => null,
				enableHiding: false,
				enableSorting: true,
			},
			{
				id: addDummyDataViewPrefix( 'last-interacted' ),
				label: __( 'Last Interacted' ),
				render: () => null,
				enableHiding: false,
				enableSorting: true,
				getValue: () => null,
			},
			{
				id: addDummyDataViewPrefix( 'status' ),
				label: __( 'Status' ),
				render: () => null,
				elements: siteStatusGroups,
				filterBy: {
					operators: [ 'is' ],
				},
				enableHiding: false,
				enableSorting: false,
				getValue: () => null,
			},
		],
		[
			__,
			openSitePreviewPane,
			userId,
			dataViewsState,
			setDataViewsState,
			isWide,
			isDesktop,
			siteStatusGroups,
		]
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
			className="sites-overview__content"
		/>
	);
};

export default DotcomSitesDataViews;
