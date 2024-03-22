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
import { useQueryJetpackPartnerPortalPartner } from 'calypso/components/data/query-jetpack-partner-portal-partner';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import useFetchMonitorVerfiedContacts from 'calypso/data/agency-dashboard/use-fetch-monitor-verified-contacts';
import SitesOverviewContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/context';
import DashboardDataContext from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/dashboard-data-context';
import { JetpackPreviewPane } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-feature-previews/jetpack-preview-pane';
import SiteTopHeaderButtons from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/site-top-header-buttons';
import SitesDataViews from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/sites-dataviews';
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
import { A4A_SITES_DASHBOARD_DEFAULT_CATEGORY } from '../constants';
import SitesDashboardContext from '../sites-dashboard-context';

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
		// We need a category in the URL if we have a selected site
		if ( sitesViewState.selectedSite && ! category ) {
			setCategory( A4A_SITES_DASHBOARD_DEFAULT_CATEGORY );
		} else if ( category && sitesViewState.selectedSite && selectedSiteFeature ) {
			page.replace(
				`/sites/${ category }/${ sitesViewState.selectedSite.url }/${ selectedSiteFeature }`
			);
		} else if ( category && sitesViewState.selectedSite ) {
			page.replace( `/sites/${ category }/${ sitesViewState.selectedSite.url }` );
		} else if ( category && category !== A4A_SITES_DASHBOARD_DEFAULT_CATEGORY ) {
			// If the selected category is the default one, we can leave the url a little cleaner, that's why we are comparing to the default category in the condition above.
			page.replace( `/sites/${ category }` );
		} else {
			page.replace( '/sites' );
		}

		if ( sitesViewState.selectedSite ) {
			dispatch( setSelectedSiteId( sitesViewState.selectedSite.blog_id ) );
		}
	}, [ sitesViewState.selectedSite, selectedSiteFeature, category, setCategory, dispatch ] );

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
					<JetpackPreviewPane
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
