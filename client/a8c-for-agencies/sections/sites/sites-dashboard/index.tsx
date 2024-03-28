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
import { OverviewFamily } from 'calypso/a8c-for-agencies/sections/sites/features/overview';
import { useQueryJetpackPartnerPortalPartner } from 'calypso/components/data/query-jetpack-partner-portal-partner';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import useFetchMonitorVerfiedContacts from 'calypso/data/agency-dashboard/use-fetch-monitor-verified-contacts';
import DashboardDataContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/dashboard-data-context';
import SiteTopHeaderButtons from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-top-header-buttons';
import SitesDataViews from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews';
import { SitesViewState } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/interfaces';
import {
	AgencyDashboardFilterMap,
	AgencyDashboardFilterOption,
	Site,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { useDispatch, useSelector } from 'calypso/state';
import { checkIfJetpackSiteGotDisconnected } from 'calypso/state/jetpack-agency-dashboard/selectors';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
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
		selectedCategory: category,
		setSelectedCategory: setCategory,
		search,
		currentPage,
		filter,
		sort,
	} = useContext( SitesDashboardContext );

	const isLargeScreen = isWithinBreakpoint( '>960px' );
	const { data: products } = useProductsQuery();
	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );

	const {
		data: verifiedContacts,
		refetch: refetchContacts,
		isError: fetchContactFailed,
	} = useFetchMonitorVerfiedContacts( isPartnerOAuthTokenLoaded );

	const [ sitesViewState, setSitesViewState ] = useState< SitesViewState >( {
		type: 'table',
		perPage: 50,
		page: currentPage,
		sort,
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

	const [ manageFilter, setManageFilter ] = useState< {
		issueTypes: AgencyDashboardFilterOption[];
		showOnlyFavorites: boolean;
	} >( {
		issueTypes: filter.issueTypes,
		showOnlyFavorites: filter.showOnlyFavorites,
	} );

	const {
		data,
		isError,
		isLoading,
		refetch: refetchSites,
	} = useFetchDashboardSites(
		isPartnerOAuthTokenLoaded,
		sitesViewState.search,
		sitesViewState.page,
		manageFilter,
		sitesViewState.sort,
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

	useEffect( () => {
		setManageFilter( {
			issueTypes: filter.issueTypes,
			showOnlyFavorites: filter.showOnlyFavorites,
		} );
	}, [ filter ] );

	// Build the query string with the search, page, sort, filter, etc.
	const buildQueryString = useCallback( () => {
		const urlQuery = new URLSearchParams();

		if ( sitesViewState.search ) {
			urlQuery.set( 's', sitesViewState.search );
		}
		if ( sitesViewState.page > 1 ) {
			urlQuery.set( 'page', sitesViewState.page.toString() );
		}
		if ( sitesViewState.sort.field && sitesViewState.sort.field !== 'url' ) {
			urlQuery.set( 'sort_field', sitesViewState.sort.field );
		}
		if ( sitesViewState.sort.direction && sitesViewState.sort.direction !== 'desc' ) {
			urlQuery.set( 'sort_direction', sitesViewState.sort.direction );
		}
		if ( manageFilter.showOnlyFavorites ) {
			urlQuery.set( 'is_favorite', 'true' );
		}
		if ( sitesViewState.filters.length > 0 ) {
			const selectedFilters = sitesViewState.filters.map( ( filter ) => {
				return (
					filtersMap.find( ( filterMap ) => filterMap.ref === filter.value )?.filterType ||
					'all_issues'
				);
			} );
			setManageFilter( {
				...manageFilter,
				issueTypes: selectedFilters ?? [],
			} );

			urlQuery.set( 'issue_types', selectedFilters.join( ',' ) );
		} else {
			urlQuery.delete( 'issue_types' );
		}

		const queryString = urlQuery.toString();

		return queryString ? `?${ queryString }` : '';
	}, [
		sitesViewState.search,
		sitesViewState.page,
		sitesViewState.perPage,
		sitesViewState.filters,
		setManageFilter,
		sitesViewState.sort,
	] );

	useEffect( () => {
		// Build the query string
		const queryString = buildQueryString();

		let url = '/sites';

		// We need a category in the URL if we have a selected site
		if ( sitesViewState.selectedSite && ! category ) {
			setCategory( A4A_SITES_DASHBOARD_DEFAULT_CATEGORY );
		} else if ( category && sitesViewState.selectedSite && selectedSiteFeature ) {
			url += `/${ category }/${ sitesViewState.selectedSite.url }/${ selectedSiteFeature }`;
		} else if ( category && sitesViewState.selectedSite ) {
			url += `/${ category }/${ sitesViewState.selectedSite.url }`;
		} else if ( category && category !== A4A_SITES_DASHBOARD_DEFAULT_CATEGORY ) {
			// If the selected category is the default one, we can leave the url a little cleaner, that's why we are comparing to the default category in the condition above.
			url += `/${ category }`;
		}

		// Update the URL without dispatching it.
		page.replace( url + queryString, null, false, false );

		if ( sitesViewState.selectedSite ) {
			dispatch( setSelectedSiteId( sitesViewState.selectedSite.blog_id ) );
		}
	}, [
		filter,
		sitesViewState.selectedSite,
		selectedSiteFeature,
		category,
		setCategory,
		dispatch,
		buildQueryString,
	] );

	const closeSitePreviewPane = useCallback( () => {
		if ( sitesViewState.selectedSite ) {
			setSitesViewState( { ...sitesViewState, type: 'table', selectedSite: undefined } );
		}
	}, [ sitesViewState, setSelectedSiteFeature ] );

	useEffect( () => {
		if ( jetpackSiteDisconnected ) {
			refetchSites();
		}
	}, [ refetchSites, jetpackSiteDisconnected ] );

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
							{ /* TODO: This component is from Jetpack Manage and it was not ported yet, just using it here as a placeholder, it looks broken but it is enough for our purposes at the moment. */ }
							<SiteTopHeaderButtons />
						</Actions>
					</LayoutHeader>
					<LayoutNavigation { ...selectedItemProps }>
						<NavigationTabs { ...selectedItemProps } items={ navItems } />
					</LayoutNavigation>
				</LayoutTop>

				<SiteNotifications />

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
	);
}
