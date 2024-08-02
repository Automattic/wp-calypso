import page from '@automattic/calypso-router';
import { isWithinBreakpoint } from '@automattic/viewport';
import { getQueryArg } from '@wordpress/url';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useContext, useEffect, useCallback, useState, useMemo } from 'react';
import GuidedTour from 'calypso/a8c-for-agencies/components/guided-tour';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutColumn from 'calypso/a8c-for-agencies/components/layout/column';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutNavigation, {
	LayoutNavigationTabs as NavigationTabs,
} from 'calypso/a8c-for-agencies/components/layout/nav';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import useNoActiveSite from 'calypso/a8c-for-agencies/hooks/use-no-active-site';
import JetpackSitesDataViews from 'calypso/a8c-for-agencies/sections/sites/features/jetpack/jetpack-sites-dataviews';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import useFetchMonitorVerifiedContacts from 'calypso/data/agency-dashboard/use-fetch-monitor-verified-contacts';
import DashboardDataContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/dashboard-data-context';
import {
	AgencyDashboardFilter,
	Site,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { checkIfJetpackSiteGotDisconnected } from 'calypso/state/jetpack-agency-dashboard/selectors';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { OverviewPreviewPane } from '../features/a4a/overview-preview-pane';
import SitesDashboardContext from '../sites-dashboard-context';
import SitesHeaderActions from '../sites-header-actions';
import SiteNotifications from '../sites-notifications';
import EmptyState from './empty-state';
import { getSelectedFilters } from './get-selected-filters';
import ProvisioningSiteNotification from './provisioning-site-notification';
import { updateSitesDashboardUrl } from './update-sites-dashboard-url';

import './style.scss';
import './sites-dataviews-style.scss';
export default function SitesDashboard() {
	const jetpackSiteDisconnected = useSelector( checkIfJetpackSiteGotDisconnected );
	const dispatch = useDispatch();

	const agencyId = useSelector( getActiveAgencyId );

	const recentlyCreatedSite = getQueryArg( window.location.href, 'created_site' ) ?? null;
	const migrationIntent = getQueryArg( window.location.href, 'migration' ) ?? null;

	const {
		dataViewsState,
		setDataViewsState,
		selectedSiteFeature,
		setSelectedSiteFeature,
		selectedCategory: category,
		setSelectedCategory: setCategory,
		showOnlyFavorites,
	} = useContext( SitesDashboardContext );

	const isLargeScreen = isWithinBreakpoint( '>960px' );
	// FIXME: We should switch to a new A4A-specific endpoint when it becomes available, instead of using the public-facing endpoint for A4A
	const { data: products } = useProductsQuery( true );

	const {
		data: verifiedContacts,
		refetch: refetchContacts,
		isError: fetchContactFailed,
	} = useFetchMonitorVerifiedContacts( false, agencyId );

	const [ agencyDashboardFilter, setAgencyDashboardFilter ] = useState< AgencyDashboardFilter >( {
		issueTypes: [],
		showOnlyFavorites: showOnlyFavorites || false,
	} );

	useEffect( () => {
		const selectedFilters = getSelectedFilters( dataViewsState.filters );

		setAgencyDashboardFilter( {
			issueTypes: selectedFilters,
			showOnlyFavorites: showOnlyFavorites || false,
		} );
	}, [ dataViewsState.filters, setAgencyDashboardFilter, showOnlyFavorites ] );

	const { data, isError, isLoading, refetch } = useFetchDashboardSites( {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: dataViewsState.search,
		currentPage: dataViewsState.page,
		filter: agencyDashboardFilter,
		sort: dataViewsState.sort,
		perPage: dataViewsState.perPage,
		agencyId,
	} );

	const noActiveSite = useNoActiveSite();

	const site = useMemo( () => {
		return dataViewsState.selectedItem
			? data?.sites.find( ( site: Site ) => site.url === dataViewsState.selectedItem )
			: undefined;
	}, [ data?.sites, dataViewsState.selectedItem ] );

	useEffect( () => {
		// If there isn't a selected site and we are showing only the preview pane we should wait for the selected site to load from the endpoint
		if ( ! site ) {
			return;
		}

		dispatch( setSelectedSiteId( site.blog_id ) );

		const updatedUrl = updateSitesDashboardUrl( {
			category: category,
			setCategory: setCategory,
			filters: dataViewsState.filters,
			selectedSite: dataViewsState.selectedItem,
			selectedSiteFeature: selectedSiteFeature,
			search: dataViewsState.search,
			currentPage: dataViewsState.page,
			sort: dataViewsState.sort,
			showOnlyFavorites,
		} );
		if ( page.current !== updatedUrl && updatedUrl !== undefined ) {
			page.show( updatedUrl );
		}
	}, [
		dataViewsState.selectedItem,
		selectedSiteFeature,
		category,
		setCategory,
		dispatch,
		dataViewsState.filters,
		dataViewsState.search,
		dataViewsState.page,
		showOnlyFavorites,
		dataViewsState.sort,
		site,
	] );

	const closeSitePreviewPane = useCallback( () => {
		const updatedUrl = updateSitesDashboardUrl( {
			category: category,
			setCategory: setCategory,
			filters: dataViewsState.filters,
			selectedSite: undefined,
			selectedSiteFeature: undefined,
			search: dataViewsState.search,
			currentPage: dataViewsState.page,
			sort: dataViewsState.sort,
			showOnlyFavorites,
		} );
		if ( page.current !== updatedUrl && updatedUrl !== undefined ) {
			page.show( updatedUrl );
		}
	}, [
		category,
		dataViewsState.filters,
		dataViewsState.page,
		dataViewsState.search,
		dataViewsState.sort,
		setCategory,
		showOnlyFavorites,
	] );

	useEffect( () => {
		if ( jetpackSiteDisconnected ) {
			refetch();
		}
	}, [ refetch, jetpackSiteDisconnected ] );

	// This is a basic representation of the feature families for now, with just the Overview tab.
	const navItems = [
		{
			label: translate( 'Overview' ),
		},
	].map( ( navItem ) => ( {
		...navItem,
		selected: translate( 'Overview' ) === navItem.label,
		children: navItem.label,
	} ) );

	const selectedItem = navItems.find( ( i ) => i.selected ) || navItems[ 0 ];
	const selectedItemProps = {
		selectedText: selectedItem.label,
	};

	const urlParams = new URLSearchParams( window.location.search );
	let tourId = null;
	if ( urlParams.get( 'tour' ) === 'sites-walkthrough' ) {
		tourId = 'sitesWalkthrough';
	} else if ( urlParams.get( 'tour' ) === 'add-new-site' ) {
		tourId = 'addSiteStep1';
	}

	if ( noActiveSite ) {
		return <EmptyState />;
	}

	return (
		<Layout
			className={ clsx( 'sites-dashboard', 'sites-dashboard__layout', ! site && 'preview-hidden' ) }
			wide
			title={ site ? null : translate( 'Sites' ) }
		>
			<LayoutColumn className="sites-overview" wide>
				<LayoutTop withNavigation={ navItems.length > 1 }>
					{ recentlyCreatedSite && (
						<ProvisioningSiteNotification
							siteId={ Number( recentlyCreatedSite ) }
							migrationIntent={ !! migrationIntent }
						/>
					) }

					<LayoutHeader>
						<Title>{ translate( 'Sites' ) }</Title>
						<Actions>
							<MobileSidebarNavigation />
							<SitesHeaderActions onWPCOMImport={ () => refetch() } />
						</Actions>
					</LayoutHeader>
					{ navItems.length > 1 && (
						<LayoutNavigation { ...selectedItemProps }>
							<NavigationTabs { ...selectedItemProps } items={ navItems } />
						</LayoutNavigation>
					) }
				</LayoutTop>

				<SiteNotifications />
				{ tourId && <GuidedTour defaultTourId={ tourId } /> }
				<QueryReaderTeams />
				<DashboardDataContext.Provider
					value={ {
						verifiedContacts: {
							emails: verifiedContacts?.emails ?? [],
							phoneNumbers: verifiedContacts?.phoneNumbers ?? [],
							refetchIfFailed: () => {
								if ( fetchContactFailed ) {
									refetchContacts();
								}
								return;
							},
						},
						products: products ?? [],
						isLargeScreen: isLargeScreen || false,
					} }
				>
					<JetpackSitesDataViews
						className={ clsx( 'sites-overview__content', {
							'is-hiding-navigation': navItems.length <= 1,
						} ) }
						data={ data }
						isLoading={ isLoading }
						isLargeScreen={ isLargeScreen || false }
						setDataViewsState={ setDataViewsState }
						dataViewsState={ dataViewsState }
						onRefetchSite={ refetch }
					/>
				</DashboardDataContext.Provider>
			</LayoutColumn>

			{ site && (
				<LayoutColumn className="site-preview-pane" wide>
					<OverviewPreviewPane
						site={ site }
						selectedSiteFeature={ selectedSiteFeature }
						setSelectedSiteFeature={ setSelectedSiteFeature }
						closeSitePreviewPane={ closeSitePreviewPane }
						isSmallScreen={ ! isLargeScreen }
						hasError={ isError }
						onRefetchSite={ refetch }
					/>
				</LayoutColumn>
			) }
		</Layout>
	);
}
