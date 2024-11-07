import page from '@automattic/calypso-router';
import { isWithinBreakpoint } from '@automattic/viewport';
import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { useContext, useEffect, useCallback, useState, useRef } from 'react';
import GuidedTour from 'calypso/a8c-for-agencies/components/guided-tour';
import {
	DATAVIEWS_LIST,
	DATAVIEWS_TABLE,
} from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
import { DataViewsState } from 'calypso/a8c-for-agencies/components/items-dashboard/items-dataviews/interfaces';
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
import { getSelectedFilters } from './get-selected-filters';
import ProvisioningSiteNotification from './provisioning-site-notification';
import { updateSitesDashboardUrl } from './update-sites-dashboard-url';

import './style.scss';
import './sites-dataviews-style.scss';
export default function SitesDashboard() {
	const jetpackSiteDisconnected = useSelector( checkIfJetpackSiteGotDisconnected );
	const dispatch = useDispatch();

	const agencyId = useSelector( getActiveAgencyId );

	const {
		dataViewsState,
		setDataViewsState,
		initialSelectedSiteUrl,
		selectedSiteFeature,
		selectedCategory: category,
		setSelectedCategory: setCategory,
		showOnlyFavorites,
		showOnlyDevelopmentSites,
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
		showOnlyDevelopmentSites: showOnlyDevelopmentSites || false,
	} );

	useEffect( () => {
		const selectedFilters = getSelectedFilters( dataViewsState.filters );

		setAgencyDashboardFilter( {
			issueTypes: selectedFilters,
			showOnlyFavorites: showOnlyFavorites || false,
			showOnlyDevelopmentSites: showOnlyDevelopmentSites || false,
		} );
	}, [
		dataViewsState.filters,
		setAgencyDashboardFilter,
		showOnlyFavorites,
		showOnlyDevelopmentSites,
	] );

	// Reset back to page one when entering Needs Attention, Favourites, or Development page.
	const selectedFilters = getSelectedFilters( dataViewsState.filters );
	const isOnNeedsAttentionPage = selectedFilters.includes( 'all_issues' );
	const prevIsOnFavouritesPageRef = useRef( showOnlyFavorites );
	const prevIsOnDevelopmentPageRef = useRef( showOnlyDevelopmentSites );
	const prevIsOnNeedsAttentionPageRef = useRef( isOnNeedsAttentionPage );

	useEffect( () => {
		const selectedFilters = getSelectedFilters( dataViewsState.filters );
		const isOnNeedsAttentionPage = selectedFilters.includes( 'all_issues' );

		if (
			prevIsOnFavouritesPageRef.current !== showOnlyFavorites ||
			prevIsOnDevelopmentPageRef.current !== showOnlyDevelopmentSites ||
			prevIsOnNeedsAttentionPageRef.current !== isOnNeedsAttentionPage
		) {
			setDataViewsState( { ...dataViewsState, page: 1 } );
		}

		prevIsOnFavouritesPageRef.current = showOnlyFavorites;
		prevIsOnDevelopmentPageRef.current = showOnlyDevelopmentSites;
		prevIsOnNeedsAttentionPageRef.current = isOnNeedsAttentionPage;
	}, [ dataViewsState, setDataViewsState, showOnlyFavorites, showOnlyDevelopmentSites ] );

	// Temporarily set perPage to 100 on Development sites page due to unresolved ES issue (https://github.com/Automattic/dotcom-forge/issues/8806)
	const sitesPerPage = showOnlyDevelopmentSites ? 100 : dataViewsState.perPage;

	const { data, isError, isLoading, refetch } = useFetchDashboardSites( {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: dataViewsState?.search,
		currentPage: dataViewsState.page ?? 1,
		filter: agencyDashboardFilter,
		sort: dataViewsState.sort,
		perPage: sitesPerPage,
		agencyId,
	} );

	useEffect( () => {
		if ( dataViewsState.selectedItem && ! initialSelectedSiteUrl ) {
			setDataViewsState( { ...dataViewsState, type: DATAVIEWS_TABLE, selectedItem: undefined } );
			return;
		}

		if (
			dataViewsState.selectedItem &&
			dataViewsState.selectedItem.url === initialSelectedSiteUrl
		) {
			return;
		}

		if ( ! isLoading && ! isError && data && initialSelectedSiteUrl ) {
			const site = data.sites.find( ( site: Site ) => site.url === initialSelectedSiteUrl );

			setDataViewsState( ( prevState: DataViewsState ) => ( {
				...prevState,
				selectedItem: site,
				type: DATAVIEWS_LIST,
			} ) );
		}
		// Omitting sitesViewState to prevent infinite loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ data, isError, isLoading, initialSelectedSiteUrl, setDataViewsState ] );

	const setUpdatedUrl = useCallback(
		( selectedSite?: Site ) => {
			const updatedUrl = updateSitesDashboardUrl( {
				category,
				setCategory,
				showOnlyFavorites,
				showOnlyDevelopmentSites,
				filters: dataViewsState.filters ?? [],
				selectedSite,
				selectedSiteFeature: selectedSiteFeature,
				search: dataViewsState.search ?? '',
				currentPage: dataViewsState.page ?? 1,
				sort: dataViewsState.sort,
			} );
			if ( page.current !== updatedUrl && updatedUrl !== undefined ) {
				page.show( updatedUrl );
			}
		},
		[
			category,
			dataViewsState.filters,
			dataViewsState.page,
			dataViewsState.search,
			dataViewsState.sort,
			selectedSiteFeature,
			setCategory,
			showOnlyDevelopmentSites,
			showOnlyFavorites,
		]
	);

	useEffect( () => {
		// If there isn't a selected site and we are showing only the preview pane we should wait for the selected site to load from the endpoint
		if ( ! dataViewsState.selectedItem ) {
			return;
		}
		dispatch( setSelectedSiteId( dataViewsState.selectedItem.blog_id ) );
		setUpdatedUrl( dataViewsState.selectedItem );
	}, [ dataViewsState.selectedItem, dispatch, setUpdatedUrl ] );

	const closeSitePreviewPane = useCallback( () => {
		if ( dataViewsState.selectedItem ) {
			const selectedItem = undefined;
			setDataViewsState( { ...dataViewsState, type: DATAVIEWS_TABLE, selectedItem } );
			setUpdatedUrl( selectedItem );
		}
	}, [ dataViewsState, setDataViewsState, setUpdatedUrl ] );

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

	return (
		<Layout
			className={ clsx(
				'sites-dashboard',
				'sites-dashboard__layout',
				! dataViewsState.selectedItem && 'preview-hidden'
			) }
			wide
			title={ dataViewsState.selectedItem ? null : translate( 'Sites' ) }
		>
			<LayoutColumn className="sites-overview" wide>
				<LayoutTop withNavigation={ navItems.length > 1 }>
					<ProvisioningSiteNotification />

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
						className={ clsx( 'sites-overview__content' ) }
						data={ data }
						isLoading={ isLoading }
						isLargeScreen={ isLargeScreen || false }
						setDataViewsState={ setDataViewsState }
						dataViewsState={ dataViewsState }
						onRefetchSite={ refetch }
					/>
				</DashboardDataContext.Provider>
			</LayoutColumn>

			{ dataViewsState.selectedItem && (
				<LayoutColumn className="site-preview-pane" wide>
					<OverviewPreviewPane
						site={ dataViewsState.selectedItem }
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
