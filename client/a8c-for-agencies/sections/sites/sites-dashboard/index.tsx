import page from '@automattic/calypso-router';
import { isWithinBreakpoint } from '@automattic/viewport';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import Layout from 'calypso/a8c-for-agencies/components/layout';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from 'calypso/a8c-for-agencies/components/layout/header';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/top';
import MobileSidebarNavigation from 'calypso/a8c-for-agencies/components/sidebar/mobile-sidebar-navigation';
import { mockedSites } from 'calypso/a8c-for-agencies/data/sites';
import useFetchMonitorVerfiedContacts from 'calypso/data/agency-dashboard/use-fetch-monitor-verified-contacts';
import LayoutNavigation, {
	LayoutNavigationTabs as NavigationTabs,
} from 'calypso/jetpack-cloud/components/layout/nav';
import SitesOverviewContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/context';
import DashboardDataContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/dashboard-data-context';
import { JetpackPreviewPane } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-feature-previews/jetpack-preview-pane';
import SiteTopHeaderButtons from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-top-header-buttons';
import SitesDataViews from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews';
import {
	SitesDataResponse,
	SitesViewState,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews/interfaces';
import { AgencyDashboardFilterMap } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { useSelector } from 'calypso/state';
import { checkIfJetpackSiteGotDisconnected } from 'calypso/state/jetpack-agency-dashboard/selectors';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import { A4A_SITES_DASHBOARD_DEFAULT_CATEGORY } from '../constants';
import SitesDashboardContext from '../sites-dashboard-context';

import './style.scss';

export default function SitesDashboard() {
	const jetpackSiteDisconnected = useSelector( checkIfJetpackSiteGotDisconnected );

	//const { hideListing } = useContext( SitesDashboardContext );
	const { selectedCategory: category, setSelectedCategory: setCategory } =
		useContext( SitesDashboardContext );

	const { selectedSiteUrl } = useContext( SitesDashboardContext );
	const { selectedSiteFeature } = useContext( SitesDashboardContext );

	const filtersMap = useMemo< AgencyDashboardFilterMap[] >(
		() => [
			{ filterType: 'all_issues', ref: 1 },
			{ filterType: 'backup_failed', ref: 2 },
			{ filterType: 'backup_warning', ref: 3 },
			{ filterType: 'threats_found', ref: 4 },
			{ filterType: 'site_disconnected', ref: 5 },
			{ filterType: 'site_down', ref: 6 },
			{ filterType: 'plugin_updates', ref: 7 },
		],
		[]
	);

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
	/*const { data, isError, isLoading, refetch } = useFetchDashboardSites(
		isPartnerOAuthTokenLoaded,
		search,
		sitesViewState.page,
		filter,
		sort,
		sitesViewState.perPage
	);*/
	//-- Mock data --// todo: fetch the sites from the API endpoint
	const data: SitesDataResponse = {
		sites: mockedSites,
		total: 5,
		perPage: 50,
		totalFavorites: 2,
	};
	const isError = false;
	const refetch = () => {};
	const isLoading = false;
	//-- End Mock data --//

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
		// We need a category in the URL if we have a selected site
		if ( selectedSiteUrl && ! category ) {
			setCategory( A4A_SITES_DASHBOARD_DEFAULT_CATEGORY );
		} else if ( category && selectedSiteUrl && selectedSiteFeature ) {
			page.replace( '/sites/' + category + '/' + selectedSiteUrl + '/' + selectedSiteFeature );
		} else if ( category && selectedSiteUrl ) {
			page.replace( '/sites/' + category + '/' + selectedSiteUrl );
		} else if ( category ) {
			page.replace( '/sites/' + category );
		} else {
			page.replace( '/sites' );
		}
	}, [ selectedSiteUrl, selectedSiteFeature, category, setCategory ] );

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
			className="sites-dashboard"
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
		>
			<div
				className={ classNames(
					'sites-dashboard__layout',
					! sitesViewState.selectedSite && 'preview-hidden'
				) }
			>
				<div className="sites-overview">
					<LayoutTop>
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
				</div>
				{ sitesViewState.selectedSite && (
					<JetpackPreviewPane
						site={ sitesViewState.selectedSite }
						closeSitePreviewPane={ closeSitePreviewPane }
						isSmallScreen={ ! isLargeScreen }
						hasError={ isError }
					/>
				) }
			</div>
		</Layout>
	);
}
