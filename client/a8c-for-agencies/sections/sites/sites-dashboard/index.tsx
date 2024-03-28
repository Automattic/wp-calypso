import page from '@automattic/calypso-router';
import { isWithinBreakpoint } from '@automattic/viewport';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import React, { useContext, useEffect, useState, useCallback } from 'react';
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
import { GuidedTourContextProvider } from 'calypso/a8c-for-agencies/data/guided-tours/guided-tour-context';
import { OverviewFamily } from 'calypso/a8c-for-agencies/sections/sites/features/overview';
import SitesDataViews from 'calypso/a8c-for-agencies/sections/sites/sites-dataviews';
import SiteTopHeaderButtons from 'calypso/a8c-for-agencies/sections/sites/sites-top-header-buttons';
import { useQueryJetpackPartnerPortalPartner } from 'calypso/components/data/query-jetpack-partner-portal-partner';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import useFetchMonitorVerfiedContacts from 'calypso/data/agency-dashboard/use-fetch-monitor-verified-contacts';
import SitesOverviewContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/context';
import DashboardDataContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/dashboard-data-context';
import { SitesViewState } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/interfaces';
import {
	AgencyDashboardFilterMap,
	Site,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { useDispatch, useSelector } from 'calypso/state';
import { checkIfJetpackSiteGotDisconnected } from 'calypso/state/jetpack-agency-dashboard/selectors';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import AddNewSiteTourStep1 from '../../onboarding-tours/add-new-site-tour-step-1';
import AddNewSiteTourStep2 from '../../onboarding-tours/add-new-site-tour-step-2';
import { sitesWalkthroughTour } from '../../onboarding-tours/sites-walkthrough-tour';
import { A4A_SITES_DASHBOARD_DEFAULT_CATEGORY } from '../constants';
import SitesDashboardContext from '../sites-dashboard-context';
import SiteNotifications from '../sites-notifications';

import './style.scss';

const filtersMap: AgencyDashboardFilterMap[] = [
	{ filterType: 'all_issues', ref: 1 },
	{ filterType: 'backup_failed', ref: 2 },
	{ filterType: 'backup_warning', ref: 3 },
	{ filterType: 'threats_found', ref: 4 },
	{ filterType: 'site_disconnected', ref: 5 },
	{ filterType: 'site_down', ref: 6 },
	{ filterType: 'plugin_updates', ref: 7 },
];

export default function SitesDashboard() {
	useQueryJetpackPartnerPortalPartner();
	const jetpackSiteDisconnected = useSelector( checkIfJetpackSiteGotDisconnected );
	const dispatch = useDispatch();

	const {
		selectedSiteUrl,
		selectedSiteFeature,
		setSelectedSiteFeature,
		isFavoriteFilter,
		selectedCategory: category,
		setSelectedCategory: setCategory,
	} = useContext( SitesDashboardContext );

	const isLargeScreen = isWithinBreakpoint( '>960px' );
	const { data: products } = useProductsQuery();
	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );
	// eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
	const { search, currentPage, filter, sort } = useContext( SitesOverviewContext );
	const {
		data: verifiedContacts,
		refetch: refetchContacts,
		isError: fetchContactFailed,
	} = useFetchMonitorVerfiedContacts( isPartnerOAuthTokenLoaded );

	const [ sitesViewState, setSitesViewState ] = useState< SitesViewState >( {
		type: 'table',
		perPage: 50,
		page: currentPage,
		sort: {
			field: 'url',
			direction: 'desc',
		},
		search: search,
		filters:
			filter?.issueTypes?.map( ( issueType ) => {
				return {
					field: 'status',
					operator: 'in',
					value: filtersMap.find( ( filterMap ) => filterMap.filterType === issueType )?.ref || 1,
				};
			} ) || [],
		hiddenFields: [ 'status' ],
		layout: {},
		selectedSite: undefined,
	} );
	const { data, isError, isLoading, refetch } = useFetchDashboardSites(
		isPartnerOAuthTokenLoaded,
		search,
		sitesViewState.page,
		filter,
		sort,
		sitesViewState.perPage
	);

	useEffect( () => {
		if ( ! isLoading && ! isError && data && selectedSiteUrl ) {
			const site = data.sites.find( ( site: Site ) => site.url === selectedSiteUrl );

			setSitesViewState( ( prevState ) => ( {
				...prevState,
				selectedSite: site,
				type: 'list',
			} ) );
		}
	}, [ data, isError, isLoading, selectedSiteUrl ] );

	const onSitesViewChange = useCallback(
		( sitesViewData: SitesViewState ) => {
			setSitesViewState( sitesViewData );
		},
		[ setSitesViewState ]
	);
	// Filter selection
	// Todo: restore this code when the filters are implemented
	/*useEffect( () => {
		if ( isLoading || isError ) {
			return;
		}
		const filtersSelected =
			sitesViewState.filters?.map( ( filter ) => {
				const filterType =
					filtersMap.find( ( filterMap ) => filterMap.ref === filter.value )?.filterType ||
					'all_issues';

				return filterType;
			} ) || [];

	}, [ isLoading, isError, sitesViewState.filters, filtersMap ] );*/

	useEffect( () => {
		// If the favorites filter is set, make sure to update the filter and correctly add the is_favorite param to URLs.
		filter.showOnlyFavorites = isFavoriteFilter;
		const favoritesParam = isFavoriteFilter ? '?is_favorite' : '';
		// We need a category in the URL if we have a selected site
		if ( sitesViewState.selectedSite && ! category ) {
			setCategory( A4A_SITES_DASHBOARD_DEFAULT_CATEGORY );
		} else if ( category && sitesViewState.selectedSite && selectedSiteFeature ) {
			page.replace(
				`/sites/${ category }/${ sitesViewState.selectedSite.url }/${ selectedSiteFeature }${ favoritesParam }`
			);
		} else if ( category && sitesViewState.selectedSite ) {
			page.replace(
				`/sites/${ category }/${ sitesViewState.selectedSite.url }${ favoritesParam }`
			);
		} else if ( category && category !== A4A_SITES_DASHBOARD_DEFAULT_CATEGORY ) {
			// If the selected category is the default one, we can leave the url a little cleaner, that's why we are comparing to the default category in the condition above.
			page.replace( `/sites/${ category }${ favoritesParam }` );
		} else {
			page.replace( `/sites${ favoritesParam }` );
		}

		if ( sitesViewState.selectedSite ) {
			dispatch( setSelectedSiteId( sitesViewState.selectedSite.blog_id ) );
		}
	}, [
		filter,
		isFavoriteFilter,
		sitesViewState.selectedSite,
		selectedSiteFeature,
		category,
		setCategory,
		dispatch,
	] );

	const closeSitePreviewPane = useCallback( () => {
		if ( sitesViewState.selectedSite ) {
			setSitesViewState( { ...sitesViewState, type: 'table', selectedSite: undefined } );
		}
	}, [ sitesViewState, setSelectedSiteFeature ] );

	useEffect( () => {
		if ( jetpackSiteDisconnected ) {
			refetch();
		}
	}, [ refetch, jetpackSiteDisconnected ] );

	const urlParams = new URLSearchParams( window.location.search );
	const shouldRenderSitesTour = true || urlParams.get( 'tour' ) === 'sites-walkthrough';
	let tour = null;
	if ( shouldRenderSitesTour ) {
		tour = sitesWalkthroughTour;
	}

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

	return (
		<GuidedTourContextProvider tour={ tour ?? undefined }>
			<Layout
				title="Sites"
				className={ classNames(
					'sites-dashboard',
					'sites-dashboard__layout',
					! sitesViewState.selectedSite && 'preview-hidden'
				) }
				wide
				withBorder={ ! sitesViewState.selectedSite }
				sidebarNavigation={ <MobileSidebarNavigation /> }
			>
				<LayoutColumn className="sites-overview" wide>
					<LayoutTop withNavigation>
						<LayoutHeader>
							<Title>{ translate( 'Sites' ) }</Title>
							<Actions>
								<SiteTopHeaderButtons />
							</Actions>
						</LayoutHeader>
						<LayoutNavigation { ...selectedItemProps }>
							<NavigationTabs { ...selectedItemProps } items={ navItems } />
						</LayoutNavigation>
					</LayoutTop>

					<SiteNotifications />
					<AddNewSiteTourStep1 />

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
						<SitesDataViews
							className="sites-overview__content"
							data={ data }
							isLoading={ isLoading }
							isLargeScreen={ isLargeScreen || false }
							onSitesViewChange={ onSitesViewChange }
							sitesViewState={ sitesViewState }
						/>
						<AddNewSiteTourStep2 siteItems={ data?.sites } />
					</DashboardDataContext.Provider>
				</LayoutColumn>

				{ sitesViewState.selectedSite && (
					<LayoutColumn className="site-preview-pane" wide>
						<OverviewFamily
							site={ sitesViewState.selectedSite }
							closeSitePreviewPane={ closeSitePreviewPane }
							isSmallScreen={ ! isLargeScreen }
							hasError={ isError }
						/>
					</LayoutColumn>
				) }
			</Layout>
		</GuidedTourContextProvider>
	);
}
