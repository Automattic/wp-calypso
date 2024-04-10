import { isWithinBreakpoint } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useContext, useEffect, useCallback, useState } from 'react';
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
import DashboardDataContext from '../sites-overview/dashboard-data-context';
import SitesDataViews from '../sites-overview/sites-dataviews';
import { SitesViewState } from '../types';
import { useDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import SitesDashboardContext from '../sites-dashboard-context';
import EmptyState from './empty-state';
import { getSelectedFilters } from './get-selected-filters';
import { updateSitesDashboardUrl } from './update-sites-dashboard-url';
import { DashboardFilter } from '../sites-overview/types';

import './style.scss';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { SiteExcerptData } from '@automattic/sites';
import { SitesDataResponse } from 'calypso/sites-dashboard/sections/sites/sites-overview/sites-dataviews/interfaces';

export default function SitesDashboard() {
	const dispatch = useDispatch();

	const {
		sitesViewState,
		setSitesViewState,
		initialSelectedSiteUrl,
		selectedCategory: category,
		setSelectedCategory: setCategory,
		sort,
	} = useContext( SitesDashboardContext );

	const isLargeScreen = isWithinBreakpoint( '>960px' );
	const isNarrowView = useBreakpoint( '<660px' );

	const [ dashboardFilter, setDashboardFilter ] = useState< DashboardFilter >( {
		siteStatus: [],
	} );

	useEffect( () => {
		const selectedFilters = getSelectedFilters( sitesViewState.filters );

		setDashboardFilter( {
			siteStatus: selectedFilters,
		} );
	}, [ sitesViewState.filters, setDashboardFilter ] );

	// const { data, isError, isLoading, refetch } = useFetchDashboardSites( {
	// 	isPartnerOAuthTokenLoaded: false,
	// 	searchQuery: sitesViewState.search,
	// 	currentPage: sitesViewState.page,
	// 	filter: dashboardFilter,
	// 	sort,
	// 	perPage: sitesViewState.perPage,
	// } );

	const { data: allSites = [], isLoading } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only
	);

	console.log( allSites );

	const sitesDataResponse: SitesDataResponse = {
		sites: allSites, // Directly using the array of SiteExcerptData objects from the hook
		total: allSites.length, // Assuming the total is the length of the allSites array
		perPage: 10, // Placeholder value, adjust based on your actual logic or source
		totalFavorites: 0, // Placeholder value, you need to calculate or source this value based on your application's logic
	};

	console.log( 'sitesDataResponse:', sitesDataResponse, 'siteViewState:', sitesViewState );

	const data = null;
	const isError = false;

	const noActiveSite = useNoActiveSite();

	useEffect( () => {
		if ( sitesViewState.selectedSite && ! initialSelectedSiteUrl ) {
			setSitesViewState( { ...sitesViewState, type: 'table', selectedSite: undefined } );
			return;
		}

		if ( sitesViewState.selectedSite ) {
			return;
		}

		if ( ! isLoading && ! isError && allSites && initialSelectedSiteUrl ) {
			const site = allSites?.find(
				( site: SiteExcerptData ) => site.URL === initialSelectedSiteUrl
			);

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
		if ( ! sitesViewState.selectedSite ) {
			return;
		}

		if ( sitesViewState.selectedSite ) {
			dispatch( setSelectedSiteId( sitesViewState.selectedSite.ID ) );
		}

		updateSitesDashboardUrl( {
			category: category,
			setCategory: setCategory,
			filters: sitesViewState.filters,
			selectedSite: sitesViewState.selectedSite,
			search: sitesViewState.search,
			currentPage: sitesViewState.page,
			sort: sitesViewState.sort,
		} );
	}, [
		sitesViewState.selectedSite,
		category,
		setCategory,
		dispatch,
		sitesViewState.filters,
		sitesViewState.search,
		sitesViewState.page,
		sitesViewState.sort,
	] );

	const closeSitePreviewPane = useCallback( () => {
		if ( sitesViewState.selectedSite ) {
			setSitesViewState( { ...sitesViewState, type: 'table', selectedSite: undefined } );
		}
	}, [ sitesViewState, setSitesViewState ] );

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

	if ( noActiveSite ) {
		return <EmptyState />;
	}

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
						{ ! isNarrowView && <Title>{ translate( 'Sites' ) }</Title> }
						{ /*<Actions>*/ }
						{ /* TODO: We were using a component from the overview header actions. We have to check if this is the best header available for the sites page. */ }
						{ /*	<OverviewHeaderActions />*/ }
						{ /*</Actions>*/ }
					</LayoutHeader>
					<LayoutNavigation { ...selectedItemProps }>
						<NavigationTabs { ...selectedItemProps } items={ navItems } />
					</LayoutNavigation>
				</LayoutTop>

				<DashboardDataContext.Provider
					value={ {
						isLargeScreen: isLargeScreen || false,
					} }
				>
					<SitesDataViews
						className="sites-overview__content"
						data={ sitesDataResponse }
						isLoading={ isLoading }
						isLargeScreen={ isLargeScreen || false }
						onSitesViewChange={ onSitesViewChange }
						sitesViewState={ sitesViewState }
					/>
				</DashboardDataContext.Provider>
			</LayoutColumn>

			{ sitesViewState.selectedSite && (
				<LayoutColumn className="site-preview-pane" wide>
					{ /*<OverviewFamily*/ }
					{ /*	site={ sitesViewState.selectedSite }*/ }
					{ /*	closeSitePreviewPane={ closeSitePreviewPane }*/ }
					{ /*	isSmallScreen={ ! isLargeScreen }*/ }
					{ /*	hasError={ isError }*/ }
					{ /*/>*/ }
					<></>
				</LayoutColumn>
			) }
		</Layout>
	);
}
