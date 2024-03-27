import page from '@automattic/calypso-router';
import { isWithinBreakpoint } from '@automattic/viewport';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import React, { useContext, useEffect, useCallback, useState } from 'react';
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
import {
	Filter,
	SitesViewState,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/interfaces';
import {
	AgencyDashboardFilter,
	Site,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { useDispatch, useSelector } from 'calypso/state';
import { checkIfJetpackSiteGotDisconnected } from 'calypso/state/jetpack-agency-dashboard/selectors';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { A4A_SITES_DASHBOARD_DEFAULT_CATEGORY, filtersMap } from '../constants';
import SitesDashboardContext from '../sites-dashboard-context';
import SiteNotifications from '../sites-notifications';

import './style.scss';

function getSelectedFilters( filters: Filter[] ) {
	return (
		filters?.map( ( filter ) => {
			const filterType =
				filtersMap.find( ( filterMap ) => filterMap.ref === filter.value )?.filterType ||
				'all_issues';

			return filterType;
		} ) || []
	);
}

export default function SitesDashboard() {
	useQueryJetpackPartnerPortalPartner();
	const jetpackSiteDisconnected = useSelector( checkIfJetpackSiteGotDisconnected );
	const dispatch = useDispatch();

	const {
		sitesViewState,
		setSitesViewState,
		selectedSiteUrl,
		selectedSiteFeature,
		selectedCategory: category,
		setSelectedCategory: setCategory,
		currentPage,
		sort,
		showOnlyFavorites,
	} = useContext( SitesDashboardContext );

	const isLargeScreen = isWithinBreakpoint( '>960px' );
	const { data: products } = useProductsQuery();
	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );

	const {
		data: verifiedContacts,
		refetch: refetchContacts,
		isError: fetchContactFailed,
	} = useFetchMonitorVerfiedContacts( isPartnerOAuthTokenLoaded );

	const [ agencyDashboardFilter, setAgencyDashboardFilter ] = useState< AgencyDashboardFilter >( {
		issueTypes: [],
		showOnlyFavorites: showOnlyFavorites || false,
	} );

	useEffect( () => {
		const selectedFilters = getSelectedFilters( sitesViewState.filters );

		setAgencyDashboardFilter( {
			issueTypes: selectedFilters,
			showOnlyFavorites: showOnlyFavorites || false,
		} );
	}, [ sitesViewState.filters, setAgencyDashboardFilter, showOnlyFavorites ] );

	const { data, isError, isLoading, refetch } = useFetchDashboardSites(
		isPartnerOAuthTokenLoaded,
		sitesViewState.search,
		sitesViewState.page,
		agencyDashboardFilter,
		sort,
		sitesViewState.perPage
	);

	useEffect( () => {
		if (
			! isLoading &&
			! isError &&
			data &&
			selectedSiteUrl &&
			sitesViewState.selectedSite?.url !== selectedSiteUrl
		) {
			const site = data.sites.find( ( site: Site ) => site.url === selectedSiteUrl );

			setSitesViewState( ( prevState ) => ( {
				...prevState,
				selectedSite: site,
				type: 'list',
			} ) );
		}
	}, [
		data,
		isError,
		isLoading,
		selectedSiteUrl,
		setSitesViewState,
		sitesViewState.selectedSite?.url,
	] );

	const onSitesViewChange = useCallback(
		( sitesViewData: SitesViewState ) => {
			setSitesViewState( sitesViewData );
		},
		[ setSitesViewState ]
	);

	// Build the query string with the search, page, sort, filter, etc.
	const buildQueryString = useCallback( () => {
		const urlQuery = new URLSearchParams();
		const selectedFilters = getSelectedFilters( sitesViewState.filters );

		if ( sitesViewState.search ) {
			urlQuery.set( 's', sitesViewState.search );
		}
		if ( currentPage > 1 ) {
			urlQuery.set( 'page', currentPage.toString() );
		}
		if ( sort.field && sort.field !== 'url' ) {
			urlQuery.set( 'sort_field', sort.field );
		}
		if ( sort.direction && sort.direction !== 'asc' ) {
			urlQuery.set( 'sort_direction', sort.direction );
		}
		if ( showOnlyFavorites ) {
			urlQuery.set( 'is_favorite', 'true' );
		}
		if ( selectedFilters && selectedFilters.length > 0 ) {
			urlQuery.set( 'issue_types', selectedFilters.join( ',' ) );
		}

		const queryString = urlQuery.toString();

		return queryString ? `?${ queryString }` : '';
	}, [
		sitesViewState.filters,
		sitesViewState.search,
		currentPage,
		sort.field,
		sort.direction,
		showOnlyFavorites,
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

		page.replace( url + queryString, null, false, false );

		if ( sitesViewState.selectedSite ) {
			dispatch( setSelectedSiteId( sitesViewState.selectedSite.blog_id ) );
		}
	}, [
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
	}, [ sitesViewState, setSitesViewState ] );

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
