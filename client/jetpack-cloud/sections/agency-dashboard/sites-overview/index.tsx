import { useMobileBreakpoint } from '@automattic/viewport-react';
import { getQueryArg, removeQueryArgs } from '@wordpress/url';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { ReactElement, useContext, useEffect, useState } from 'react';
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

export default function SitesOverview(): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isMobile = useMobileBreakpoint();
	const jetpackSiteDisconnected = useSelector( checkIfJetpackSiteGotDisconnected );
	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );
	const purchasedLicense = useSelector( getPurchasedLicense );

	const highlightFavoriteTab = getQueryArg( window.location.href, 'highlight' ) === 'favorite-tab';

	const [ hightLightTab, setHightLightTab ] = useState( false );

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
			setHightLightTab( true );
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

	const navItems = [
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
				setHightLightTab( false );
				dispatch(
					recordTracksEvent( 'calypso_jetpack_agency_dashboard_tab_click', {
						nav_item: navItem.key,
					} )
				);
			},
			children: navItem.label,
		};
	} );

	const selectedItem = navItems.find( ( i ) => i.selected ) || navItems[ 0 ];

	return (
		<div className="sites-overview">
			<DocumentHead title={ pageTitle } />
			<SidebarNavigation sectionTitle={ pageTitle } />
			<div className="sites-overview__container">
				<SiteWelcomeBanner isDashboardView />
				{ purchasedLicense && data?.sites && (
					<SiteAddLicenseNotification purchasedLicense={ purchasedLicense } />
				) }
				<div className="sites-overview__page-title-container">
					<h2 className="sites-overview__page-title">{ pageTitle }</h2>
					<div className="sites-overview__page-subtitle">
						{ translate( 'Manage all your Jetpack sites from one location' ) }
					</div>
				</div>
				<SectionNav
					selectedText={
						<span>
							{ selectedItem.label }
							<Count count={ selectedItem.count } compact={ true } />
						</span>
					}
					selectedCount={ selectedItem.count }
					className={ classNames(
						'sites-overview__section-nav',
						isMobile &&
							hightLightTab &&
							selectedItem.key === 'favorites' &&
							'site-overview__highlight-tab'
					) }
				>
					<NavTabs selectedText={ selectedItem.label } selectedCount={ selectedItem.count }>
						{ navItems.map( ( props ) => (
							<NavItem { ...props } compactCount={ true } />
						) ) }
					</NavTabs>
				</SectionNav>
				<SiteSearchFilterContainer
					searchQuery={ search }
					currentPage={ currentPage }
					filter={ filter }
					isLoading={ isLoading }
				/>
				<SiteContent
					data={ data }
					isError={ isError }
					isLoading={ isLoading }
					currentPage={ currentPage }
				/>
			</div>
		</div>
	);
}
