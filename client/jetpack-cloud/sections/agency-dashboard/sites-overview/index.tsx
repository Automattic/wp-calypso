import { useMobileBreakpoint } from '@automattic/viewport-react';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useContext, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Count from 'calypso/components/count';
import DocumentHead from 'calypso/components/data/document-head';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	checkIfJetpackSiteGotDisconnected,
	getPurchasedLicense,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import SitesOverviewContext from './context';
import SiteAddLicenseNotification from './site-add-license-notification';
import SiteContent from './site-content';
import SiteSearchFilterContainer from './site-search-filter-container/SiteSearchFilterContainer';
import SiteWelcomeBanner from './site-welcome-banner';

import './style.scss';

export default function SitesOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isMobile = useMobileBreakpoint();
	const jetpackSiteDisconnected = useSelector( checkIfJetpackSiteGotDisconnected );
	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );
	const purchasedLicenseInfo = useSelector( getPurchasedLicense );

	const highlightFavoriteTab = getQueryArg( window.location.href, 'highlight' ) === 'favorite-tab';

	const [ highlightTab, setHighlightTab ] = useState( false );

	const { search, currentPage, filter } = useContext( SitesOverviewContext );

	const { data, isError, isLoading, refetch } = useFetchDashboardSites(
		isPartnerOAuthTokenLoaded,
		search,
		currentPage,
		filter
	);

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_agency_dashboard_visit' ) );
	}, [ dispatch ] );

	useEffect( () => {
		if ( highlightFavoriteTab ) {
			setHighlightTab( true );
			page.redirect( removeQueryArgs( window.location.pathname, 'highlight' ) );
		}
	}, [ highlightFavoriteTab ] );

	useEffect( () => {
		if ( jetpackSiteDisconnected ) {
			refetch();
		}
	}, [ refetch, jetpackSiteDisconnected ] );

	const pageTitle = translate( 'Dashboard' );

	const basePath = '/dashboard';

	const navItems = useMemo(
		() =>
			[
				{
					key: 'all',
					label: isMobile ? translate( 'All Sites' ) : translate( 'All' ),
				},
				{
					key: 'favorites',
					label: translate( 'Favorites' ),
				},
			].map( ( navItem ) => {
				const isFavorite = navItem.key === 'favorites';
				return {
					...navItem,
					count: ( isFavorite ? data?.totalFavorites : data?.total ) || 0,
					selected: isFavorite ? filter.showOnlyFavorites : ! filter.showOnlyFavorites,
					path: `${ basePath }${ isFavorite ? '/favorites' : '' }${ search ? '?s=' + search : '' }`,
					onClick: () => {
						dispatch(
							recordTracksEvent( 'calypso_jetpack_agency_dashboard_tab_click', {
								nav_item: navItem.key,
							} )
						);
					},
					children: navItem.label,
				};
			} ),
		[
			data?.total,
			data?.totalFavorites,
			dispatch,
			filter.showOnlyFavorites,
			isMobile,
			search,
			translate,
		]
	);

	const selectedTab = navItems.find( ( i ) => i.selected ) || navItems[ 0 ];
	const hasAppliedFilter = !! search || filter?.issueTypes?.length > 0;
	const showEmptyState = ! isLoading && ! isError && ! data?.sites?.length;

	let emptyStateMessage = '';
	if ( showEmptyState ) {
		emptyStateMessage = translate( 'No active sites' );
		if ( filter.showOnlyFavorites ) {
			emptyStateMessage = translate( "You don't have any favorites yet." );
		}
		if ( hasAppliedFilter ) {
			emptyStateMessage = translate( 'No results found. Please try refining your search.' );
		}
	}

	const isFavoritesTab = selectedTab.key === 'favorites';

	return (
		<div className="sites-overview">
			<DocumentHead title={ pageTitle } />
			<SidebarNavigation sectionTitle={ pageTitle } />
			<div className="sites-overview__container">
				<div className="sites-overview__tabs">
					<div className="sites-overview__content-wrapper">
						<SiteWelcomeBanner isDashboardView />
						{ purchasedLicenseInfo && data?.sites && (
							<SiteAddLicenseNotification licenseInfo={ purchasedLicenseInfo } />
						) }
						<div className="sites-overview__page-title-container">
							<h2 className="sites-overview__page-title">{ pageTitle }</h2>
							<div className="sites-overview__page-subtitle">
								{ translate( 'Manage all your Jetpack sites from one location' ) }
							</div>
						</div>
						<SectionNav
							applyUpdatedStyles
							selectedText={
								<span>
									{ selectedTab.label }
									<Count count={ selectedTab.count } compact={ true } />
								</span>
							}
							selectedCount={ selectedTab.count }
							className={ classNames(
								isMobile && highlightTab && isFavoritesTab && 'sites-overview__highlight-tab'
							) }
						>
							<NavTabs selectedText={ selectedTab.label } selectedCount={ selectedTab.count }>
								{ navItems.map( ( props ) => (
									<NavItem { ...props } compactCount={ true } />
								) ) }
							</NavTabs>
						</SectionNav>
					</div>
				</div>
				<div className="sites-overview__content">
					<div className="sites-overview__content-wrapper">
						{ ( ! showEmptyState || hasAppliedFilter ) && (
							<SiteSearchFilterContainer
								searchQuery={ search }
								currentPage={ currentPage }
								filter={ filter }
								isLoading={ isLoading }
							/>
						) }
						{ showEmptyState ? (
							<div className="sites-overview__no-sites">{ emptyStateMessage }</div>
						) : (
							<SiteContent
								data={ data }
								isLoading={ isLoading }
								currentPage={ currentPage }
								isFavoritesTab={ isFavoritesTab }
							/>
						) }
					</div>
				</div>
			</div>
		</div>
	);
}
