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
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import useFetchMonitorVerifiedContacts from 'calypso/data/agency-dashboard/use-fetch-monitor-verified-contacts';
import DashboardDataContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/dashboard-data-context';
import SitesDataViews from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews';
import { SitesViewState } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/interfaces';
import {
	AgencyDashboardFilter,
	Site,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { checkIfJetpackSiteGotDisconnected } from 'calypso/state/jetpack-agency-dashboard/selectors';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import OverviewHeaderActions from '../../overview/header-actions';
import SitesDashboardContext from '../sites-dashboard-context';
import SiteNotifications from '../sites-notifications';
import { getSelectedFilters } from './get-selected-filters';
import { updateSitesDashboardUrl } from './update-sites-dashboard-url';

import './style.scss';

export default function SitesDashboard() {
	const jetpackSiteDisconnected = useSelector( checkIfJetpackSiteGotDisconnected );
	const dispatch = useDispatch();

	const agency = useSelector( getActiveAgency );
	const agencyId = agency ? agency.id : undefined;

	const {
		sitesViewState,
		setSitesViewState,
		initialSelectedSiteUrl,
		selectedSiteFeature,
		selectedCategory: category,
		setSelectedCategory: setCategory,
		sort,
		showOnlyFavorites,
		hideListing,
		setHideListing,
	} = useContext( SitesDashboardContext );

	const isLargeScreen = isWithinBreakpoint( '>960px' );
	const { data: products } = useProductsQuery();

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
		const selectedFilters = getSelectedFilters( sitesViewState.filters );

		setAgencyDashboardFilter( {
			issueTypes: selectedFilters,
			showOnlyFavorites: showOnlyFavorites || false,
		} );
	}, [ sitesViewState.filters, setAgencyDashboardFilter, showOnlyFavorites ] );

	const { data, isError, isLoading, refetch } = useFetchDashboardSites( {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: sitesViewState.search,
		currentPage: sitesViewState.page,
		filter: agencyDashboardFilter,
		sort,
		perPage: sitesViewState.perPage,
		agencyId,
	} );

	useEffect( () => {
		if ( sitesViewState.selectedSite && ! initialSelectedSiteUrl ) {
			setSitesViewState( { ...sitesViewState, type: 'table', selectedSite: undefined } );
			setHideListing( false );
			return;
		}

		if ( sitesViewState.selectedSite ) {
			return;
		}

		if ( ! isLoading && ! isError && data && initialSelectedSiteUrl ) {
			const site = data.sites.find( ( site: Site ) => site.url === initialSelectedSiteUrl );

			setSitesViewState( ( prevState ) => ( {
				...prevState,
				selectedSite: site,
				type: 'list',
			} ) );
		}
	}, [ data, isError, isLoading, initialSelectedSiteUrl, setSitesViewState ] );

	const onSitesViewChange = useCallback(
		( sitesViewData: SitesViewState ) => {
			setSitesViewState( sitesViewData );
		},
		[ setSitesViewState ]
	);

	useEffect( () => {
		// If there isn't a selected site and we are showing only the preview pane we should wait for the selected site to load from the endpoint
		if ( hideListing && ! sitesViewState.selectedSite ) {
			return;
		}

		if ( sitesViewState.selectedSite ) {
			dispatch( setSelectedSiteId( sitesViewState.selectedSite.blog_id ) );
		}

		updateSitesDashboardUrl( {
			category: category,
			setCategory: setCategory,
			filters: sitesViewState.filters,
			selectedSite: sitesViewState.selectedSite,
			selectedSiteFeature: selectedSiteFeature,
			search: sitesViewState.search,
			currentPage: sitesViewState.page,
			sort: sitesViewState.sort,
			showOnlyFavorites: showOnlyFavorites,
		} );
	}, [
		sitesViewState.selectedSite,
		selectedSiteFeature,
		category,
		setCategory,
		dispatch,
		sitesViewState.filters,
		sitesViewState.search,
		sitesViewState.page,
		showOnlyFavorites,
		sitesViewState.sort,
		hideListing,
	] );

	const closeSitePreviewPane = useCallback( () => {
		if ( sitesViewState.selectedSite ) {
			setSitesViewState( { ...sitesViewState, type: 'table', selectedSite: undefined } );
			setHideListing( false );
		}
	}, [ sitesViewState, setSitesViewState, setHideListing ] );

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
			{ ! hideListing && (
				<LayoutColumn className="sites-overview" wide>
					<LayoutTop withNavigation>
						<LayoutHeader>
							<Title>{ translate( 'Sites' ) }</Title>
							<Actions>
								{ /* TODO: We were using a component from the overview header actions. We have to check if this is the best header available for the sites page. */ }
								<OverviewHeaderActions />
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
			) }

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
