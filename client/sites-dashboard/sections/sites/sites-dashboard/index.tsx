import { isWithinBreakpoint } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useContext, useEffect, useCallback, useState } from 'react';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import useFetchMonitorVerifiedContacts from 'calypso/data/agency-dashboard/use-fetch-monitor-verified-contacts';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { useDispatch, useSelector } from 'calypso/state';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { checkIfJetpackSiteGotDisconnected } from 'calypso/state/jetpack-agency-dashboard/selectors';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import GuidedTour from '../../../components/a4a-components/guided-tour';
import Layout from '../../../components/a4a-components/layout';
import LayoutColumn from '../../../components/a4a-components/layout/column';
import LayoutHeader, {
	LayoutHeaderTitle as Title,
	LayoutHeaderActions as Actions,
} from '../../../components/a4a-components/layout/header';
import LayoutNavigation, {
	LayoutNavigationTabs as NavigationTabs,
} from '../../../components/a4a-components/layout/nav';
import LayoutTop from '../../../components/a4a-components/layout/top';
import MobileSidebarNavigation from '../../../components/a4a-components/sidebar/mobile-sidebar-navigation';
import { type TourId } from '../../../data/guided-tours/use-guided-tours';
import useNoActiveSite from '../../../hooks/use-no-active-site';
import { OverviewFamily } from '../../sites/features/overview';
import DashboardDataContext from '../../sites-overview/dashboard-data-context';
import { AgencyDashboardFilter, Site } from '../../sites-overview/types';
import SitesDashboardContext from '../sites-dashboard-context';
import SitesDataViews from '../sites-dataviews';
import { SitesViewState } from '../sites-dataviews/interfaces';
import SitesHeaderActions from '../sites-header-actions';
import EmptyState from './empty-state';
import { getSelectedFilters } from './get-selected-filters';
import { updateSitesDashboardUrl } from './update-sites-dashboard-url';
import './style.scss';

export default function SitesDashboard() {
	const { data: liveSites = [], isLoading } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only
	);

	const { data: deletedSites = [] } = useSiteExcerptsQuery(
		[],
		( site ) => ! site.options?.is_domain_only,
		'deleted'
	);
	const allSites = liveSites.concat( deletedSites );

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
		showOnlyFavorites,
		hideListing,
		setHideListing,
	} = useContext( SitesDashboardContext );

	const isLargeScreen = isWithinBreakpoint( '>960px' );
	const isNarrowView = useBreakpoint( '<660px' );
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
		const selectedFilters = getSelectedFilters( sitesViewState.filters );

		setAgencyDashboardFilter( {
			issueTypes: selectedFilters,
			showOnlyFavorites: showOnlyFavorites || false,
		} );
	}, [ sitesViewState.filters, setAgencyDashboardFilter, showOnlyFavorites ] );

	const { data, isError, refetch } = useFetchDashboardSites( {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: sitesViewState.search,
		currentPage: sitesViewState.page,
		filter: agencyDashboardFilter,
		sort: sitesViewState.sort,
		perPage: sitesViewState.perPage,
		agencyId,
	} );

	const noActiveSite = useNoActiveSite();

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
		// Omitting sitesViewState to prevent infinite loop
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ data, isError, isLoading, initialSelectedSiteUrl, setSitesViewState, setHideListing ] );

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
			showOnlyFavorites,
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
				! sitesViewState.selectedSite && 'preview-hidden'
			) }
			wide
			sidebarNavigation={ <MobileSidebarNavigation /> }
			title={ sitesViewState.selectedSite ? null : translate( 'Sites' ) }
		>
			{ ! hideListing && (
				<LayoutColumn className="sites-overview" wide>
					<LayoutTop withNavigation={ navItems.length > 1 }>
						<LayoutHeader>
							{ ! isNarrowView && <Title>{ translate( 'Sites' ) }</Title> }
							<Actions>
								<SitesHeaderActions />
							</Actions>
						</LayoutHeader>
						{ navItems.length > 1 && (
							<LayoutNavigation { ...selectedItemProps }>
								<NavigationTabs { ...selectedItemProps } items={ navItems } />
							</LayoutNavigation>
						) }
					</LayoutTop>

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
						<SitesDataViews
							className={ classNames( 'sites-overview__content', {
								'is-hiding-navigation': navItems.length <= 1,
							} ) }
							data={ allSites }
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
