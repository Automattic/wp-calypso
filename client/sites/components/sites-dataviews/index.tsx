import {
	SiteExcerptData,
	SITE_EXCERPT_REQUEST_FIELDS,
	SITE_EXCERPT_REQUEST_OPTIONS,
} from '@automattic/sites';
import { useQueryClient } from '@tanstack/react-query';
import { usePrevious } from '@wordpress/compose';
import { DataViews, Field } from '@wordpress/dataviews';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import JetpackLogo from 'calypso/components/jetpack-logo';
import TimeSince from 'calypso/components/time-since';
import { USE_SITE_EXCERPTS_QUERY_KEY } from 'calypso/data/sites/use-site-excerpts-query';
import useRestoreSiteMutation from 'calypso/sites/hooks/use-restore-site-mutation';
import { SitePlan } from 'calypso/sites-dashboard/components/sites-site-plan';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useActions } from './actions';
import SiteField from './dataviews-fields/site-field';
import { SiteStats } from './sites-site-stats';
import { SiteStatus } from './sites-site-status';
import type { View } from '@wordpress/dataviews';

import './style.scss';
import './dataview-style.scss';

type Props = {
	sites: SiteExcerptData[];
	isLoading: boolean;
	paginationInfo: { totalItems: number; totalPages: number };
	dataViewsState: View;
	setDataViewsState: ( callback: ( prevState: View ) => View ) => void;
	selectedItem: SiteExcerptData | null | undefined;
	openSitePreviewPane: ( site: SiteExcerptData ) => void;
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
	selectedItem,
	openSitePreviewPane,
}: Props ) => {
	const { __ } = useI18n();
	const userId = useSelector( getCurrentUserId );

	// Scroll to selected site in the list when in list view.
	const scrollContainerRef = useRef< HTMLElement >();
	const previousDataViewsState = usePrevious( dataViewsState );
	const previousSelectedItem = usePrevious( selectedItem );
	useLayoutEffect( () => {
		if ( ! scrollContainerRef.current || previousDataViewsState?.type !== dataViewsState.type ) {
			scrollContainerRef.current = document.querySelector( '.dataviews-view-list' ) as HTMLElement;
		}

		if ( ! previousSelectedItem && selectedItem && dataViewsState.type === 'list' ) {
			window.setTimeout(
				() => scrollContainerRef.current?.querySelector( 'li.is-selected' )?.scrollIntoView(),
				300
			);
			return;
		}

		if ( previousDataViewsState?.page !== dataViewsState.page ) {
			scrollContainerRef.current?.scrollTo( 0, 0 );
		}
	}, [
		dataViewsState.type,
		dataViewsState.page,
		selectedItem,
		previousDataViewsState,
		previousSelectedItem,
	] );

	// By default, DataViews is in an "uncontrolled" mode, meaning the current selection is handled internally.
	// However, each time a site is selected, the URL changes, so, the component is remounted and the current selection is lost.
	// To prevent that, we want to use DataViews in "controlled" mode, so that we can pass an initial selection during initial mount.
	//
	// To do that, we need to pass a required `onSelectionChange` callback to signal that it is being used in controlled mode.
	// However, when don't need to do anything in the callback, because we already maintain a selectedItem state.
	// The current selection is a derived value which is [selectedItem.ID] (see getSelection()).
	const onSelectionChange = () => {};
	const getSelection = useCallback(
		() => ( selectedItem ? [ selectedItem.ID.toString() ] : undefined ),
		[ selectedItem ]
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

	const queryClient = useQueryClient();
	const reduxDispatch = useReduxDispatch();
	const { mutate: restoreSite, isPending: isRestoring } = useRestoreSiteMutation( {
		onSuccess() {
			queryClient.invalidateQueries( {
				queryKey: [
					USE_SITE_EXCERPTS_QUERY_KEY,
					SITE_EXCERPT_REQUEST_FIELDS,
					SITE_EXCERPT_REQUEST_OPTIONS,
					[],
					'all',
				],
			} );
			queryClient.invalidateQueries( {
				queryKey: [
					USE_SITE_EXCERPTS_QUERY_KEY,
					SITE_EXCERPT_REQUEST_FIELDS,
					SITE_EXCERPT_REQUEST_OPTIONS,
					[],
					'deleted',
				],
			} );
			reduxDispatch(
				successNotice( __( 'The site has been restored.' ), {
					duration: 3000,
				} )
			);
		},
		onError: ( error ) => {
			if ( error.status === 403 ) {
				reduxDispatch(
					errorNotice( __( 'Only an administrator can restore a deleted site.' ), {
						duration: 5000,
					} )
				);
			} else {
				reduxDispatch(
					errorNotice( __( 'We were unable to restore the site.' ), { duration: 5000 } )
				);
			}
		},
	} );

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
				render: ( { item }: { item: SiteExcerptData } ) => (
					<SiteStatus site={ item } isRestoring={ isRestoring } />
				),
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
				id: 'last-interacted',
				label: __( 'Last Interacted' ),
				render: () => null,
				enableHiding: false,
				enableSorting: true,
				getValue: () => null,
			},
		],
		[ __, openSitePreviewPane, userId, siteStatusGroups, isRestoring ]
	);

	const actions = useActions( { restoreSite } );

	return (
		<div className="sites-dataviews">
			<DataViews
				data={ sites }
				fields={ fields }
				onChangeView={ ( newView ) => setDataViewsState( () => newView ) }
				view={ dataViewsState }
				actions={ actions }
				search
				searchLabel={ __( 'Search sites…' ) }
				selection={ getSelection() }
				paginationInfo={ paginationInfo }
				getItemId={ ( item ) => {
					// @ts-expect-error -- From ItemsDataViews, this item.id assignation is to fix an issue with the DataViews component and item selection. It should be removed once the issue is fixed.
					item.id = item.ID.toString();
					return item.ID.toString();
				} }
				isLoading={ isLoading }
				defaultLayouts={ { table: {} } }
				onChangeSelection={ onSelectionChange }
			/>
		</div>
	);
};

export default DotcomSitesDataViews;
