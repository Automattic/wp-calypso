import {
	type SiteExcerptData,
	SitesSortKey,
	useSitesListFiltering,
	useSitesListGrouping,
	useSitesListSorting,
} from '@automattic/sites';
import { GroupableSiteLaunchStatuses } from '@automattic/sites/src/use-sites-list-grouping';
import { DESKTOP_BREAKPOINT, WIDE_BREAKPOINT } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GuidedTour from 'calypso/a8c-for-agencies/components/guided-tour';
import {
	DATAVIEWS_LIST,
	DATAVIEWS_TABLE,
	initialDataViewsState,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import { GuidedTourContextProvider } from 'calypso/a8c-for-agencies/data/guided-tours/guided-tour-context';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { isP2Theme } from 'calypso/lib/site/utils';
import {
	SitesDashboardQueryParams,
	handleQueryParamChange,
} from 'calypso/sites-dashboard/components/sites-content-controls';
import { useSitesSorting } from 'calypso/state/sites/hooks/use-sites-sorting';
import { useInitializeDataViewsPage } from '../hooks/use-initialize-dataviews-page';
import { useShowSiteCreationNotice } from '../hooks/use-show-site-creation-notice';
import { useShowSiteTransferredNotice } from '../hooks/use-show-site-transferred-notice';
import { useSyncSelectedSite } from '../hooks/use-sync-selected-site';
import { useSyncSelectedSiteFeature } from '../hooks/use-sync-selected-site-feature';
import {
	CALYPSO_ONBOARDING_TOURS_PREFERENCE_NAME,
	CALYPSO_ONBOARDING_TOURS_EVENT_NAMES,
	useOnboardingTours,
} from '../onboarding-tours';
import { DOTCOM_OVERVIEW, FEATURE_TO_ROUTE_MAP } from './site-preview-pane/constants';
import DotcomPreviewPane from './site-preview-pane/dotcom-preview-pane';
import SitesDashboardBannersManager from './sites-dashboard-banners-manager';
import SitesDashboardHeader from './sites-dashboard-header';
import DotcomSitesDataViews, { useSiteStatusGroups } from './sites-dataviews';
import { getSitesPagination } from './sites-dataviews/utils';
import type { SiteDetails } from '@automattic/data-stores';
import type { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';

// todo: we are using A4A styles until we extract them as common styles in the ItemsDashboard component
import './style.scss';

// Add Dotcom specific styles
import './dotcom-style.scss';

import './guided-tours.scss';

interface SitesDashboardProps {
	queryParams: SitesDashboardQueryParams;
	selectedSite?: SiteDetails | null;
	initialSiteFeature?: string;
	selectedSiteFeaturePreview?: React.ReactNode;
	sectionName?: string;
}

const siteSortingKeys = [
	{ dataView: 'site', sortKey: 'alphabetically' },
	{ dataView: 'last-publish', sortKey: 'updatedAt' },
	{ dataView: 'last-interacted', sortKey: 'lastInteractedWith' },
	{ dataView: 'plan', sortKey: 'plan' },
	{ dataView: 'status', sortKey: 'status' },
];

const DEFAULT_PER_PAGE = 50;
const DEFAULT_SITE_TYPE = 'non-p2';

const SitesDashboard = ( {
	// Note - control params (eg. search, page, perPage, status...) are currently meant for
	// initializing the dataViewsState. Further calculations should reference the dataViewsState.
	queryParams: {
		page = 1,
		perPage = DEFAULT_PER_PAGE,
		search,
		newSiteID,
		status,
		siteType = DEFAULT_SITE_TYPE,
	},
	selectedSite,
	initialSiteFeature = DOTCOM_OVERVIEW,
	selectedSiteFeaturePreview = undefined,
}: SitesDashboardProps ) => {
	const [ initialSortApplied, setInitialSortApplied ] = useState( false );
	const isWide = useBreakpoint( WIDE_BREAKPOINT );
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );
	const { hasSitesSortingPreferenceLoaded, sitesSorting, onSitesSortingChange } = useSitesSorting();
	const sitesFilterCallback = ( site: SiteExcerptData ) => {
		const { options } = site || {};

		// Early return if the site is domain-only
		if ( options?.is_domain_only ) {
			return false;
		}

		// siteType is 'all' - filter out sites that are P2 sites
		if ( siteType === DEFAULT_SITE_TYPE ) {
			return (
				! options?.is_wpforteams_site &&
				( ! options?.theme_slug || ! isP2Theme( options.theme_slug ) )
			);
		}

		// siteType is 'p2' - filter out sites that are not P2
		return (
			!! options?.is_wpforteams_site ||
			!! ( options?.theme_slug && isP2Theme( options.theme_slug ) )
		);
	};

	const { data: allSites = [], isLoading } = useSiteExcerptsQuery(
		[],
		sitesFilterCallback,
		'all',
		[ 'is_a4a_dev_site', 'site_migration' ],
		[ 'theme_slug' ]
	);

	useShowSiteCreationNotice( allSites, newSiteID );
	useShowSiteTransferredNotice();

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

	// Limit fields on breakpoints smaller than 960px wide.
	const desktopFields = [ 'site', 'plan', 'status', 'last-publish', 'stats', 'actions' ];
	const mobileFields = [ 'site', 'actions' ];

	const getFieldsByBreakpoint = ( isDesktop: boolean ) =>
		isDesktop ? desktopFields : mobileFields;

	// Create the DataViews state based on initial values
	const defaultDataViewsState = {
		...initialDataViewsState,
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
		selectedItem: selectedSite,
		type: selectedSite ? DATAVIEWS_LIST : DATAVIEWS_TABLE,
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
				actions: {
					width: '74px',
				},
			},
		},
	} as DataViewsState;
	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( defaultDataViewsState );

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
		if ( dataViewsState.layout.styles.site.width !== siteNameColumnWidth ) {
			setDataViewsState( ( prevState ) => ( {
				...prevState,
				layout: {
					styles: {
						...prevState.layout.styles,
						site: {
							width: siteNameColumnWidth,
						},
					},
				},
			} ) );
		}
	}, [ isDesktop, isWide, dataViewsState?.fields, dataViewsState?.layout?.styles?.site?.width ] );

	useSyncSelectedSite( dataViewsState, setDataViewsState, selectedSite );

	const { selectedSiteFeature, setSelectedSiteFeature } = useSyncSelectedSiteFeature( {
		selectedSite,
		initialSiteFeature,
		dataViewsState,
		featureToRouteMap: FEATURE_TO_ROUTE_MAP,
		queryParamKeys: [ 'page', 'per-page', 'status', 'search', 'siteType' ],
	} );

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
	const { currentStatusGroup, statuses } = useSitesListGrouping( allSites, {
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

	const onboardingTours = useOnboardingTours();

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

	// Manage the closing of the preview pane
	const closeSitePreviewPane = useCallback( () => {
		if ( dataViewsState.selectedItem ) {
			setDataViewsState( { ...dataViewsState, type: DATAVIEWS_TABLE, selectedItem: undefined } );
			//setHideListing( false );
		}
	}, [ dataViewsState, setDataViewsState ] );

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

	const changeSitePreviewPane = ( siteId: number ) => {
		const targetSite = allSites.find( ( site ) => site.ID === siteId );
		if ( targetSite ) {
			openSitePreviewPane( targetSite );
		}
	};

	// todo: temporary mock data
	const hideListing = false;
	const isNarrowView = false;

	const dashboardTitle = siteType === 'p2' ? translate( 'P2s' ) : translate( 'Sites' );

	return (
		<Layout
			className={ clsx(
				'sites-dashboard',
				'sites-dashboard__layout',
				! dataViewsState.selectedItem && 'preview-hidden'
			) }
			wide
			title={ dataViewsState.selectedItem ? null : dashboardTitle }
			disableGuidedTour
		>
			<DocumentHead title={ dashboardTitle } />

			{ ! hideListing && (
				<LayoutColumn className="sites-overview" wide>
					<LayoutTop withNavigation={ false }>
						<LayoutHeader>
							{ ! isNarrowView && <Title>{ dashboardTitle }</Title> }
							<Actions>
								<SitesDashboardHeader isPreviewPaneOpen={ !! dataViewsState.selectedItem } />
							</Actions>
						</LayoutHeader>
					</LayoutTop>

					<DocumentHead title={ dashboardTitle } />
					<SitesDashboardBannersManager
						sitesStatuses={ statuses }
						sitesCount={ paginatedSites.length }
					/>

					<DotcomSitesDataViews
						sites={ paginatedSites }
						isLoading={ isLoading || ! initialSortApplied }
						paginationInfo={ getSitesPagination( filteredSites, perPage ) }
						dataViewsState={ dataViewsState }
						setDataViewsState={ setDataViewsState }
					/>
				</LayoutColumn>
			) }

			{ dataViewsState.selectedItem && (
				<GuidedTourContextProvider
					guidedTours={ onboardingTours }
					preferenceNames={ CALYPSO_ONBOARDING_TOURS_PREFERENCE_NAME }
					eventNames={ CALYPSO_ONBOARDING_TOURS_EVENT_NAMES }
				>
					<LayoutColumn className="site-preview-pane" wide>
						<DotcomPreviewPane
							site={ dataViewsState.selectedItem }
							selectedSiteFeature={ selectedSiteFeature }
							selectedSiteFeaturePreview={ selectedSiteFeaturePreview }
							setSelectedSiteFeature={ setSelectedSiteFeature }
							closeSitePreviewPane={ closeSitePreviewPane }
							changeSitePreviewPane={ changeSitePreviewPane }
						/>
					</LayoutColumn>
					<GuidedTour defaultTourId="siteManagementTour" />
				</GuidedTourContextProvider>
			) }
		</Layout>
	);
};

export default SitesDashboard;
