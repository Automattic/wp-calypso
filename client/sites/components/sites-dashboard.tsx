import { isEnabled } from '@automattic/calypso-config';
import pagejs from '@automattic/calypso-router';
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
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import React, { useEffect, useMemo, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import GuidedTour from 'calypso/components/guided-tour';
import { GuidedTourContextProvider } from 'calypso/components/guided-tour/data/guided-tour-context';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import Layout from 'calypso/layout/multi-sites-dashboard';
import LayoutColumn from 'calypso/layout/multi-sites-dashboard/column';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/layout/multi-sites-dashboard/header';
import LayoutTop from 'calypso/layout/multi-sites-dashboard/top';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isP2Theme } from 'calypso/lib/site/utils';
import {
	SitesDashboardQueryParams,
	handleQueryParamChange,
} from 'calypso/sites-dashboard/components/sites-content-controls';
import { useSelector } from 'calypso/state';
import { shouldShowSiteDashboard } from 'calypso/state/global-sidebar/selectors';
import { useSitesSorting } from 'calypso/state/sites/hooks/use-sites-sorting';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { useInitializeDataViewsPage } from '../hooks/use-initialize-dataviews-page';
import { useShowSiteCreationNotice } from '../hooks/use-show-site-creation-notice';
import { useShowSiteTransferredNotice } from '../hooks/use-show-site-transferred-notice';
import { useTracksEventOnFilterChange } from '../hooks/use-tracks-event-on-filter-change';
import {
	CALYPSO_ONBOARDING_TOURS_PREFERENCE_NAME,
	CALYPSO_ONBOARDING_TOURS_EVENT_NAMES,
	useOnboardingTours,
} from '../onboarding-tours';
import { DOTCOM_OVERVIEW, FEATURE_TO_ROUTE_MAP, OVERVIEW } from './site-preview-pane/constants';
import DotcomPreviewPane from './site-preview-pane/dotcom-preview-pane';
import SitesDashboardBannersManager from './sites-dashboard-banners-manager';
import SitesDashboardHeader from './sites-dashboard-header';
import DotcomSitesDataViews, { useSiteStatusGroups } from './sites-dataviews';
import { getSitesPagination } from './sites-dataviews/utils';
import type { View } from '@wordpress/dataviews';

// todo: we are using A4A styles until we extract them as common styles in the ItemsDashboard component
import './style.scss';

// Add Dotcom specific styles
import './dotcom-style.scss';

import './guided-tours.scss';

interface SitesDashboardProps {
	queryParams: SitesDashboardQueryParams;
	initialSiteFeature?: string;
	selectedSiteFeaturePreview?: React.ReactNode;
	sectionName?: string;
}

const siteSortingKeys = [
	{ dataView: 'site-title', sortKey: 'alphabetically' },
	{ dataView: 'last-publish', sortKey: 'updatedAt' },
	{ dataView: 'last-interacted', sortKey: 'lastInteractedWith' },
	{ dataView: 'plan', sortKey: 'plan' },
	{ dataView: 'status', sortKey: 'status' },
];

const DEFAULT_PER_PAGE = 50;
const DEFAULT_SITE_TYPE = 'non-p2';

const desktopFields = [ 'site', 'plan', 'status', 'last-publish', 'stats' ];
const mobileFields = [ 'site' ];
const listViewFields = [ 'site-title' ];

const getFieldsByBreakpoint = ( selectedSite: boolean, isDesktop: boolean ) => {
	if ( selectedSite ) {
		return listViewFields;
	}
	return isDesktop ? desktopFields : mobileFields;
};

export function showSitesPage( route: string, openInNewTab = false ) {
	const currentParams = new URL( window.location.href ).searchParams;
	const newUrl = new URL( route, window.location.origin );

	const supportedParams = [ 'page', 'per-page', 'search', 'status', 'siteType' ];
	supportedParams.forEach( ( param ) => {
		if ( currentParams.has( param ) ) {
			const value = currentParams.get( param );
			if ( value ) {
				newUrl.searchParams.set( param, value );
			}
		}
	} );

	if ( openInNewTab ) {
		const newWindow = window.open(
			newUrl.toString().replace( window.location.origin, '' ),
			'_blank'
		);
		if ( newWindow ) {
			newWindow.opener = null;
		}
	} else {
		pagejs.show( newUrl.toString().replace( window.location.origin, '' ) );
	}
}

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
	initialSiteFeature = isEnabled( 'untangling/hosting-menu' ) ? OVERVIEW : DOTCOM_OVERVIEW,
	selectedSiteFeaturePreview = undefined,
}: SitesDashboardProps ) => {
	const [ initialSortApplied, setInitialSortApplied ] = useState( false );
	const isWide = useBreakpoint( WIDE_BREAKPOINT );
	const isDesktop = useBreakpoint( DESKTOP_BREAKPOINT );
	const { hasSitesSortingPreferenceLoaded, sitesSorting, onSitesSortingChange } = useSitesSorting();
	const selectedSite = useSelector( getSelectedSite );

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

	// Create the DataViews state based on initial values
	const defaultDataViewsState: View = {
		sort: {
			field: '',
			direction: 'asc',
		},
		page,
		perPage,
		search: search ?? '',
		fields: getFieldsByBreakpoint( !! selectedSite, isDesktop ),
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
			? {
					type: 'list',
					layout: {
						primaryField: 'site-title',
						mediaField: 'icon',
					},
			  }
			: {
					type: 'table',
					layout: {
						primaryField: 'site',
						combinedFields: [
							{
								id: 'site',
								label: __( 'Site' ),
								children: [ 'icon', 'site-title' ],
								direction: 'horizontal',
							},
						],
						styles: {
							site: {
								width: '40%',
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
		const fields = getFieldsByBreakpoint( !! selectedSite, isDesktop );
		const fieldsForBreakpoint = [ ...fields ].sort().toString();
		const existingFields = [ ...( dataViewsState?.fields ?? [] ) ].sort().toString();
		// Compare the content of the arrays, not its referrences that will always be different.
		// sort() sorts the array in place, so we need to clone them first.
		if ( existingFields !== fieldsForBreakpoint ) {
			setDataViewsState( ( prevState ) => ( { ...prevState, fields } ) );
		}
	}, [ isDesktop, isWide, dataViewsState, selectedSite ] );

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

	useTracksEventOnFilterChange( dataViewsState.filters ?? [] );

	// Manage the closing of the preview pane
	const closeSitePreviewPane = () => {
		if ( selectedSite ) {
			showSitesPage( '/sites' );
		}
	};

	const openSitePreviewPane = (
		site: SiteExcerptData,
		source: 'site_field' | 'action' | 'list_row_click' | 'environment_switcher',
		openInNewTab?: boolean
	) => {
		recordTracksEvent( 'calypso_sites_dashboard_open_site_preview_pane', {
			site_id: site.ID,
			source,
		} );
		showSitesPage(
			`/${ FEATURE_TO_ROUTE_MAP[ initialSiteFeature ].replace( ':site', site.slug ) }`,
			openInNewTab
		);
	};

	const changeSitePreviewPane = ( siteId: number ) => {
		const targetSite = allSites.find( ( site ) => site.ID === siteId );
		if ( targetSite ) {
			openSitePreviewPane( targetSite, 'environment_switcher' );
		}
	};

	const showSiteDashboard = useSelector( ( state ) =>
		shouldShowSiteDashboard( state, selectedSite?.ID ?? null )
	);
	if ( !! selectedSite && ! showSiteDashboard ) {
		return null;
	}

	// todo: temporary mock data
	const hideListing = false;
	const isNarrowView = false;

	const dashboardTitle = siteType === 'p2' ? translate( 'P2s' ) : translate( 'Sites' );

	return (
		<Layout
			className={ clsx(
				'sites-dashboard',
				'sites-dashboard__layout',
				! selectedSite && 'preview-hidden'
			) }
			wide
			title={ selectedSite ? null : dashboardTitle }
		>
			<DocumentHead title={ dashboardTitle } />

			{ ! hideListing && (
				<LayoutColumn className="sites-overview" wide>
					<LayoutTop withNavigation={ false }>
						<LayoutHeader>
							{ ! isNarrowView && <Title>{ dashboardTitle }</Title> }
							<Actions>
								<SitesDashboardHeader isPreviewPaneOpen={ !! selectedSite } />
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
						selectedItem={ selectedSite }
						openSitePreviewPane={ openSitePreviewPane }
					/>
				</LayoutColumn>
			) }

			{ selectedSite && (
				<GuidedTourContextProvider
					guidedTours={ onboardingTours }
					preferenceNames={ CALYPSO_ONBOARDING_TOURS_PREFERENCE_NAME }
					eventNames={ CALYPSO_ONBOARDING_TOURS_EVENT_NAMES }
				>
					<LayoutColumn className="site-preview-pane" wide>
						<DotcomPreviewPane
							site={ selectedSite }
							selectedSiteFeature={ initialSiteFeature }
							selectedSiteFeaturePreview={ selectedSiteFeaturePreview }
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
