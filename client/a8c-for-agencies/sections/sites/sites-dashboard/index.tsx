import page from '@automattic/calypso-router';
import { isWithinBreakpoint } from '@automattic/viewport';
import { getQueryArg } from '@wordpress/url';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useContext, useEffect } from 'react';
import GuidedTour from 'calypso/a8c-for-agencies/components/guided-tour';
import { DATAVIEWS_TABLE } from 'calypso/a8c-for-agencies/components/items-dashboard/constants';
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
import { type TourId } from 'calypso/a8c-for-agencies/data/guided-tours/use-guided-tours';
import useNoActiveSite from 'calypso/a8c-for-agencies/hooks/use-no-active-site';
import JetpackSitesDataViews from 'calypso/a8c-for-agencies/sections/sites/features/jetpack/jetpack-sites-dataviews';
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

	const {
		dataViewsState,
		setDataViewsState,
		selectedSiteFeature,
		selectedCategory: category,
		siteUrl,
		showOnlyFavorites,
		showPreviewPane,
		closePreviewPane,
	} = useContext( SitesDashboardContext );

	const isLargeScreen = isWithinBreakpoint( '>960px' );
	// FIXME: We should switch to a new A4A-specific endpoint when it becomes available, instead of using the public-facing endpoint for A4A
	const { data: products } = useProductsQuery( true );

	const {
		data: verifiedContacts,
		refetch: refetchContacts,
		isError: fetchContactFailed,
	} = useFetchMonitorVerifiedContacts( false, agencyId );

	const agencyDashboardFilters: AgencyDashboardFilter = {
		issueTypes: getSelectedFilters( dataViewsState.filters ).status,
		siteTags: getSelectedFilters( dataViewsState.filters ).siteTags,
		showOnlyFavorites: showOnlyFavorites || false,
	};

	const { data, isError, isLoading, refetch } = useFetchDashboardSites( {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: dataViewsState.search,
		currentPage: dataViewsState.page,
		filter: agencyDashboardFilters,
		sort: dataViewsState.sort,
		perPage: dataViewsState.perPage,
		agencyId,
	} );

	const noActiveSite = useNoActiveSite();

	// Defines the DataViews.selectedItem when
	// the data is loaded from the back-end
	// Useful when reloading the page while
	// the PreviewPane is open
	useEffect( () => {
		if ( siteUrl ) {
			setDataViewsState( {
				...dataViewsState,
				type: DATAVIEWS_TABLE,
				selectedItem: data?.sites.find( ( site: Site ) => site.url === siteUrl ),
			} );
		}
	}, [ data ] );

	useEffect( () => {
		if ( dataViewsState.selectedItem ) {
			dispatch( setSelectedSiteId( dataViewsState.selectedItem.blog_id ) );
		}
	}, [ dispatch, setSelectedSiteId, dataViewsState.selectedItem ] );

	useEffect( () => {
		const updatedUrl = updateSitesDashboardUrl( {
			category,
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
		selectedSiteFeature,
		category,
		dataViewsState.filters,
		dataViewsState.search,
		dataViewsState.page,
		dataViewsState.selectedItem,
		showOnlyFavorites,
		dataViewsState.sort,
		updateSitesDashboardUrl,
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
			className={ classNames(
				'sites-dashboard',
				'sites-dashboard__layout',
				! dataViewsState.selectedItem && 'preview-hidden'
			) }
			wide
			title={ dataViewsState.selectedItem ? null : translate( 'Sites' ) }
		>
			<LayoutColumn className="sites-overview" wide>
				<LayoutTop withNavigation={ navItems.length > 1 }>
					{ recentlyCreatedSite && (
						<ProvisioningSiteNotification siteId={ Number( recentlyCreatedSite ) } />
					) }

					<LayoutHeader>
						<Title>{ translate( 'Sites' ) }</Title>
						<Actions>
							<MobileSidebarNavigation />
							<SitesHeaderActions />
						</Actions>
					</LayoutHeader>
					{ navItems.length > 1 && (
						<LayoutNavigation { ...selectedItemProps }>
							<NavigationTabs { ...selectedItemProps } items={ navItems } />
						</LayoutNavigation>
					) }
				</LayoutTop>

				<SiteNotifications />
				{ tourId && <GuidedTour defaultTourId={ tourId as TourId } /> }

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
						className={ classNames( 'sites-overview__content', {
							'is-hiding-navigation': navItems.length <= 1,
						} ) }
						data={ data }
						isLoading={ isLoading }
						isLargeScreen={ isLargeScreen || false }
						setDataViewsState={ setDataViewsState }
						dataViewsState={ dataViewsState }
					/>
				</DashboardDataContext.Provider>
			</LayoutColumn>

			{ dataViewsState.selectedItem && showPreviewPane && (
				<LayoutColumn className="site-preview-pane" wide>
					<OverviewPreviewPane
						site={ dataViewsState.selectedItem }
						closeSitePreviewPane={ closePreviewPane }
						isSmallScreen={ ! isLargeScreen }
						hasError={ isError }
					/>
				</LayoutColumn>
			) }
		</Layout>
	);
}
