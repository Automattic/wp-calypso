import { Gridicon } from '@automattic/components';
import { localizeUrl, useHasEnTranslation } from '@automattic/i18n-utils';
import {
	type SiteExcerptData,
	SitesSortKey,
	useSitesListFiltering,
	useSitesListGrouping,
	useSitesListSorting,
} from '@automattic/sites';
import { GroupableSiteLaunchStatuses } from '@automattic/sites/src/use-sites-list-grouping';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import GuidedTour from 'calypso/a8c-for-agencies/components/guided-tour';
import {
	DATAVIEWS_LIST,
	DATAVIEWS_TABLE,
	initialDataViewsState,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, {
	LayoutHeaderActions as Actions,
	LayoutHeaderTitle as Title,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import { GuidedTourContextProvider } from 'calypso/a8c-for-agencies/data/guided-tours/guided-tour-context';
import Banner from 'calypso/components/banner';
import DocumentHead from 'calypso/components/data/document-head';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import {
	SitesDashboardQueryParams,
	handleQueryParamChange,
} from 'calypso/sites-dashboard/components/sites-content-controls';
import { useSitesSorting } from 'calypso/state/sites/hooks/use-sites-sorting';
import { useInitializeDataViewsPage } from '../hooks/use-initialize-dataviews-page';
import { useInitializeDataViewsSelectedItem } from '../hooks/use-initialize-dataviews-selected-item';
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
import SitesDashboardHeader from './sites-dashboard-header';
import DotcomSitesDataViews, { siteStatusGroups } from './sites-dataviews';
import { getSitesPagination, addDummyDataViewPrefix } from './sites-dataviews/utils';
import type { SiteDetails } from '@automattic/data-stores';

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
}

const siteSortingKeys = [
	// Put the dummy data view at the beginning for searching the sort key.
	{ dataView: addDummyDataViewPrefix( 'site' ), sortKey: 'alphabetically' },
	{ dataView: addDummyDataViewPrefix( 'last-publish' ), sortKey: 'updatedAt' },
	{ dataView: addDummyDataViewPrefix( 'last-interacted' ), sortKey: 'lastInteractedWith' },
	{ dataView: 'site', sortKey: 'alphabetically' },
	{ dataView: 'last-publish', sortKey: 'updatedAt' },
];

const DEFAULT_PER_PAGE = 50;
const DEFAULT_STATUS_GROUP = 'all';

const SitesDashboard = ( {
	// Note - control params (eg. search, page, perPage, status...) are currently meant for
	// initializing the dataViewsState. Further calculations should reference the dataViewsState.
	queryParams: {
		page = 1,
		perPage = DEFAULT_PER_PAGE,
		search,
		newSiteID,
		status = DEFAULT_STATUS_GROUP,
	},
	selectedSite,
	initialSiteFeature = DOTCOM_OVERVIEW,
	selectedSiteFeaturePreview = undefined,
}: SitesDashboardProps ) => {
	const { __ } = useI18n();
	const [ initialSortApplied, setInitialSortApplied ] = useState( false );

	const { hasSitesSortingPreferenceLoaded, sitesSorting, onSitesSortingChange } = useSitesSorting();

	const { data: allSites = [], isLoading } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only
	);

	const hasEnTranslation = useHasEnTranslation();

	useShowSiteCreationNotice( allSites, newSiteID );
	useShowSiteTransferredNotice();

	// Create the DataViews state based on initial values
	const defaultDataViewsState = {
		...initialDataViewsState,
		page,
		perPage,
		search: search ?? '',
		hiddenFields: [
			addDummyDataViewPrefix( 'site' ),
			addDummyDataViewPrefix( 'last-publish' ),
			addDummyDataViewPrefix( 'last-interacted' ),
			addDummyDataViewPrefix( 'status' ),
		],
		filters: [
			{
				field: addDummyDataViewPrefix( 'status' ),
				operator: 'in',
				value: siteStatusGroups.find( ( item ) => item.slug === status )?.value || 1,
			},
		],
		selectedItem: selectedSite,
		type: selectedSite ? DATAVIEWS_LIST : DATAVIEWS_TABLE,
	} as DataViewsState;
	const [ dataViewsState, setDataViewsState ] = useState< DataViewsState >( defaultDataViewsState );

	useSyncSelectedSite( dataViewsState, setDataViewsState, selectedSite );

	const { selectedSiteFeature, setSelectedSiteFeature } = useSyncSelectedSiteFeature( {
		selectedSite,
		initialSiteFeature,
		dataViewsState,
		featureToRouteMap: FEATURE_TO_ROUTE_MAP,
		queryParamKeys: [ 'page', 'per-page', 'status', 'search' ],
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
	}, [ hasSitesSortingPreferenceLoaded, sitesSorting, dataViewsState.sort, initialSortApplied ] );

	// Get the status group slug.
	const statusSlug = useMemo( () => {
		const statusFilter = dataViewsState.filters.find(
			( filter ) => filter.field === addDummyDataViewPrefix( 'status' )
		);
		const statusNumber = statusFilter?.value || 1;
		return ( siteStatusGroups.find( ( status ) => status.value === statusNumber )?.slug ||
			'all' ) as GroupableSiteLaunchStatuses;
	}, [ dataViewsState.filters ] );

	// Filter sites list by status group.
	const { currentStatusGroup } = useSitesListGrouping( allSites, {
		status: statusSlug,
		showHidden: true,
	} );

	// Perform sorting actions
	const sortedSites = useSitesListSorting( currentStatusGroup, {
		sortKey: siteSortingKeys.find( ( key ) => key.dataView === dataViewsState.sort.field )
			?.sortKey as SitesSortKey,
		sortOrder: dataViewsState.sort.direction || undefined,
	} );

	// Filter sites list by search query.
	const filteredSites = useSitesListFiltering( sortedSites, {
		search: dataViewsState.search,
	} );

	const paginatedSites = filteredSites.slice(
		( dataViewsState.page - 1 ) * dataViewsState.perPage,
		dataViewsState.page * dataViewsState.perPage
	);

	const onboardingTours = useOnboardingTours();

	useInitializeDataViewsPage( dataViewsState, setDataViewsState );
	useInitializeDataViewsSelectedItem( { selectedSite, paginatedSites } );

	// Update URL with view control params on change.
	useEffect( () => {
		const queryParams = {
			search: dataViewsState.search?.trim(),
			status: statusSlug === DEFAULT_STATUS_GROUP ? undefined : statusSlug,
			page: dataViewsState.page > 1 ? dataViewsState.page : undefined,
			'per-page': dataViewsState.perPage === DEFAULT_PER_PAGE ? undefined : dataViewsState.perPage,
		};

		window.setTimeout( () => handleQueryParamChange( queryParams ) );
	}, [ dataViewsState.search, dataViewsState.page, dataViewsState.perPage, statusSlug ] );

	// Update site sorting preference on change
	useEffect( () => {
		if ( dataViewsState.sort.field ) {
			onSitesSortingChange( {
				sortKey: siteSortingKeys.find( ( key ) => key.dataView === dataViewsState.sort.field )
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

	const showA8CForAgenciesBanner = paginatedSites.length >= 5;

	return (
		<Layout
			className={ clsx(
				'sites-dashboard',
				'sites-dashboard__layout',
				! dataViewsState.selectedItem && 'preview-hidden'
			) }
			wide
			title={ dataViewsState.selectedItem ? null : translate( 'Sites' ) }
			disableGuidedTour
		>
			<DocumentHead title={ __( 'Sites' ) } />

			{ ! hideListing && (
				<LayoutColumn className="sites-overview" wide>
					<LayoutTop withNavigation={ false }>
						<LayoutHeader>
							{ ! isNarrowView && <Title>{ translate( 'Sites' ) }</Title> }
							<Actions>
								<SitesDashboardHeader />
							</Actions>
						</LayoutHeader>
					</LayoutTop>

					<DocumentHead title={ __( 'Sites' ) } />
					{ showA8CForAgenciesBanner && (
						<div className="sites-a8c-for-agencies-banner-container">
							<Banner
								callToAction={ translate( 'Learn more {{icon/}}', {
									components: {
										icon: <Gridicon icon="external" />,
									},
								} ) }
								className="sites-a8c-for-agencies-banner"
								description={
									hasEnTranslation(
										"Earn up to 50% revenue share and get volume discounts on WordPress.com hosting when you migrate sites to our platform and promote Automattic's products to clients."
									)
										? translate(
												"Earn up to 50% revenue share and get volume discounts on WordPress.com hosting when you migrate sites to our platform and promote Automattic's products to clients."
										  )
										: translate(
												'Manage multiple WordPress sites from one place, get volume discounts on hosting products, and earn up to 50% revenue share when you migrate sites to our platform and refer our products to clients.'
										  )
								}
								dismissPreferenceName="dismissible-card-a8c-for-agencies-sites"
								event="learn-more"
								horizontal
								href={ localizeUrl(
									'https://wordpress.com/for-agencies?ref=wpcom-sites-dashboard'
								) }
								target="_blank"
								title={
									hasEnTranslation( "Here's how to earn more" )
										? translate( "Here's how to earn more" )
										: translate( 'Managing multiple sites? Meet our agency hosting' )
								}
								tracksClickName="calypso_sites_dashboard_a4a_banner_click"
							/>
						</div>
					) }
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
