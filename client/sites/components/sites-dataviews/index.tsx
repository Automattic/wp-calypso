import {
	SitesSortKey,
	useSitesListFiltering,
	useSitesListGrouping,
	useSitesListSorting,
	SiteExcerptData,
} from '@automattic/sites';
import { GroupableSiteLaunchStatuses } from '@automattic/sites/src/use-sites-list-grouping';
import { DESKTOP_BREAKPOINT, WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { usePrevious } from '@wordpress/compose';
import { DataViews, Field } from '@wordpress/dataviews';
import { useI18n } from '@wordpress/react-i18n';
import { useCallback, useEffect, useMemo, useRef, useLayoutEffect, useState } from 'react';
import JetpackLogo from 'calypso/components/jetpack-logo';
import TimeSince from 'calypso/components/time-since';
import { handleQueryParamChange } from 'calypso/sites-dashboard/components/sites-content-controls';
import { SitePlan } from 'calypso/sites-dashboard/components/sites-site-plan';
import { useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { useSitesSorting } from 'calypso/state/sites/hooks/use-sites-sorting';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { useInitializeDataViewsPage } from '../../hooks/use-initialize-dataviews-page';
import SitesDashboardBannersManager from '../sites-dashboard-banners-manager';
import { useActions } from './actions';
import SiteField from './dataviews-fields/site-field';
import { SiteStats } from './sites-site-stats';
import { SiteStatus } from './sites-site-status';
import { getSitesPagination } from './utils';
import type { View } from '@wordpress/dataviews';

import './style.scss';
import './dataview-style.scss';

const siteSortingKeys = [
	{ dataView: 'site', sortKey: 'alphabetically' },
	{ dataView: 'last-publish', sortKey: 'updatedAt' },
	{ dataView: 'last-interacted', sortKey: 'lastInteractedWith' },
	{ dataView: 'plan', sortKey: 'plan' },
	{ dataView: 'status', sortKey: 'status' },
];

// Limit fields on breakpoints smaller than 960px wide.
const desktopFields = [ 'site', 'plan', 'status', 'last-publish', 'stats' ];
const mobileFields = [ 'site' ];

const getFieldsByBreakpoint = ( isDesktop: boolean ) =>
	isDesktop ? desktopFields : mobileFields;

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
	openSitePreviewPane,
}: {
	sites: SiteExcerptData[];
	isLoading: boolean;
	paginationInfo: { totalItems: number; totalPages: number };
	openSitePreviewPane: ( site: SiteExcerptData ) => void;
} ) => {
	const { __ } = useI18n();
	const userId = useSelector( getCurrentUserId );

	const [ initialSortApplied, setInitialSortApplied ] = useState( false );
	const isWide = useBreakpoint( WIDE_BREAKPOINT );
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );
	const { hasSitesSortingPreferenceLoaded, sitesSorting, onSitesSortingChange } = useSitesSorting();
	const selectedSite = useSelector( getSelectedSite );

	const siteStatusGroups = useSiteStatusGroups();
	const getSiteNameColWidth = ( isDesktop: boolean, isWide: boolean ) => {
		if ( isWide ) {
			return '40%';
		}
		if ( isDesktop ) {
			return '50%';
		}
		return '70%';
	};

	// Create the DataViews state based on initial values
	const defaultDataViewsState: View = {
		sort: {
			field: '',
			direction: 'asc',
		},
		page,
		perPage,
		search: search ?? '',
		fields: getFieldsByBreakpoint( isDesktop ),
		...( status
			? {
					filters: [
						{
							field: 'status',
							operator: 'is',
							value: siteStatusGroups.find( ( item ) => item.slug === status )?.value || 1,
						},
					],
			  }
			: {} ),
		...( selectedSite
			? { type: 'list', layout: {} }
			: {
					type: 'table',
					layout: {
						styles: {
							site: {
								width: getSiteNameColWidth( isDesktop, isWide ),
							},
							plan: {
								width: '126px',
							},
							status: {
								width: '142px',
							},
							'last-publish': {
								width: '146px',
							},
							stats: {
								width: '106px',
							},
						},
					},
			  } ),
	};
	const [ dataViewsState, setDataViewsState ] = useState< View >( defaultDataViewsState );

	useEffect( () => {
		const fields = getFieldsByBreakpoint( isDesktop );
		const fieldsForBreakpoint = [ ...fields ].sort().toString();
		const existingFields = [ ...( dataViewsState?.fields ?? [] ) ].sort().toString();
		// Compare the content of the arrays, not its referrences that will always be different.
		// sort() sorts the array in place, so we need to clone them first.
		if ( existingFields !== fieldsForBreakpoint ) {
			setDataViewsState( ( prevState ) => ( { ...prevState, fields } ) );
		}

		const siteNameColumnWidth = getSiteNameColWidth( isDesktop, isWide );

		if (
			dataViewsState.type === 'table' &&
			dataViewsState.layout?.styles?.site?.width !== siteNameColumnWidth
		) {
			setDataViewsState( {
				...dataViewsState,
				layout: {
					styles: {
						...dataViewsState.layout?.styles,
						site: {
							width: siteNameColumnWidth,
						},
					},
				},
			} );
		}
	}, [ isDesktop, isWide, dataViewsState ] );

	// Ensure site sort preference is applied when it loads in. This isn't always available on
	// initial mount.
	useEffect( () => {
		// Ensure we set and check initialSortApplied to prevent infinite loops when changing sort
		// values after initial sort.
		if ( hasSitesSortingPreferenceLoaded && ! initialSortApplied ) {
			const newSortField =
				siteSortingKeys.find( ( key ) => key.sortKey === sitesSorting.sortKey )?.dataView || '';
			const newSortDirection = sitesSorting.sortOrder;

			setDataViewsState( ( prevState ) => ( {
				...prevState,
				sort: {
					field: newSortField,
					direction: newSortDirection,
				},
			} ) );

			setInitialSortApplied( true );
		}
	}, [
		hasSitesSortingPreferenceLoaded,
		sitesSorting,
		dataViewsState.sort,
		initialSortApplied,
		siteType,
	] );

	// Get the status group slug.
	const statusSlug = useMemo( () => {
		const statusFilter = dataViewsState.filters?.find( ( filter ) => filter.field === 'status' );
		const statusNumber = statusFilter?.value;
		return siteStatusGroups.find( ( status ) => status.value === statusNumber )
			?.slug as GroupableSiteLaunchStatuses;
	}, [ dataViewsState.filters, siteStatusGroups ] );

	// Filter sites list by status group.
	const { currentStatusGroup, statuses } = useSitesListGrouping( sites, {
		status: statusSlug || 'all',
		showHidden: true,
	} );

	// Perform sorting actions
	const sortedSites = useSitesListSorting( currentStatusGroup, {
		sortKey: siteSortingKeys.find( ( key ) => key.dataView === dataViewsState.sort?.field )
			?.sortKey as SitesSortKey,
		sortOrder: dataViewsState.sort?.direction || undefined,
	} );

	// Filter sites list by search query.
	const filteredSites = useSitesListFiltering( sortedSites, {
		search: dataViewsState.search,
	} );

	const paginatedSites =
		dataViewsState.page && dataViewsState.perPage
			? filteredSites.slice(
					( dataViewsState.page - 1 ) * dataViewsState.perPage,
					dataViewsState.page * dataViewsState.perPage
			  )
			: filteredSites;

	useInitializeDataViewsPage( dataViewsState, setDataViewsState );

	// Update URL with view control params on change.
	useEffect( () => {
		const queryParams = {
			search: dataViewsState.search?.trim(),
			status: statusSlug,
			page: dataViewsState.page && dataViewsState.page > 1 ? dataViewsState.page : undefined,
			'per-page': dataViewsState.perPage === DEFAULT_PER_PAGE ? undefined : dataViewsState.perPage,
		};

		window.setTimeout( () => handleQueryParamChange( queryParams ) );
	}, [ dataViewsState.search, dataViewsState.page, dataViewsState.perPage, statusSlug ] );

	// Update site sorting preference on change
	useEffect( () => {
		if ( dataViewsState.sort?.field ) {
			onSitesSortingChange( {
				sortKey: siteSortingKeys.find( ( key ) => key.dataView === dataViewsState.sort?.field )
					?.sortKey as SitesSortKey,
				sortOrder: dataViewsState.sort.direction || 'asc',
			} );
		}
	}, [ dataViewsState.sort, onSitesSortingChange ] );

	// Scroll to selected site in the list when in list view.
	const scrollContainerRef = useRef< HTMLElement >();
	const previousDataViewsState = usePrevious( dataViewsState );
	const previousSelectedItem = usePrevious( selectedSite );
	useLayoutEffect( () => {
		if ( ! scrollContainerRef.current || previousDataViewsState?.type !== dataViewsState.type ) {
			scrollContainerRef.current = document.querySelector( '.dataviews-view-list' ) as HTMLElement;
		}

		if ( ! previousSelectedItem && selectedSite && dataViewsState.type === 'list' ) {
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
		selectedSite,
		previousDataViewsState,
		previousSelectedItem,
	] );

	// By default, DataViews is in an "uncontrolled" mode, meaning the current selection is handled internally.
	// However, each time a site is selected, the URL changes, so, the component is remounted and the current selection is lost.
	// To prevent that, we want to use DataViews in "controlled" mode, so that we can pass an initial selection during initial mount.
	//
	// To do that, we need to pass a required `onSelectionChange` callback to signal that it is being used in controlled mode.
	// However, when don't need to do anything in the callback, because we already maintain a selectedSite state.
	// The current selection is a derived value which is [selectedSite.ID] (see getSelection()).
	const onSelectionChange = () => {};
	const getSelection = useCallback(
		() => ( selectedSite ? [ selectedSite.ID.toString() ] : undefined ),
		[ selectedSite ]
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
				id: 'last-interacted',
				label: __( 'Last Interacted' ),
				render: () => null,
				enableHiding: false,
				enableSorting: true,
				getValue: () => null,
			},
		],
		[ __, openSitePreviewPane, userId, siteStatusGroups ]
	);

	const actions = useActions();

	return (
		<div className="sites-dataviews">
			<DataViews
				data={ paginatedSites }
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
