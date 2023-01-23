import { Button } from '@automattic/components';
import { isWithinBreakpoint } from '@automattic/viewport';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { getQueryArg, removeQueryArgs, addQueryArgs } from '@wordpress/url';
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
import useDetectWindowBoundary from 'calypso/lib/detect-window-boundary';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { resetSite } from 'calypso/state/jetpack-agency-dashboard/actions';
import {
	checkIfJetpackSiteGotDisconnected,
	getSelectedLicenses,
	getSelectedLicensesSiteId,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import OnboardingWidget from '../../partner-portal/primary/onboarding-widget';
import SitesOverviewContext from './context';
import SiteAddLicenseNotification from './site-add-license-notification';
import SiteContent from './site-content';
import SiteSearchFilterContainer from './site-search-filter-container/SiteSearchFilterContainer';
import SiteWelcomeBanner from './site-welcome-banner';
import { getProductSlugFromProductType } from './utils';
import type { Site } from '../sites-overview/types';

import './style.scss';

const CALYPSO_MASTERBAR_HEIGHT = 47;

export default function SitesOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isMobile = useMobileBreakpoint();
	const jetpackSiteDisconnected = useSelector( checkIfJetpackSiteGotDisconnected );
	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );

	const selectedLicenses = useSelector( getSelectedLicenses );
	const selectedLicensesSiteId = useSelector( getSelectedLicensesSiteId );

	const selectedLicensesCount = selectedLicenses?.length;

	const highlightFavoriteTab = getQueryArg( window.location.href, 'highlight' ) === 'favorite-tab';

	const [ highlightTab, setHighlightTab ] = useState( false );

	const { search, currentPage, filter, selectedSites, setSelectedSites } =
		useContext( SitesOverviewContext );

	const { data, isError, isLoading, refetch } = useFetchDashboardSites(
		isPartnerOAuthTokenLoaded,
		search,
		currentPage,
		filter
	);

	const selectedSiteIds = selectedSites.map( ( site ) => site.blog_id );

	function handleSetSelectedSites( selectedSite: Site ) {
		if ( selectedSiteIds.includes( selectedSite.blog_id ) ) {
			setSelectedSites( selectedSites.filter( ( site ) => site.blog_id !== selectedSite.blog_id ) );
		} else {
			setSelectedSites( [ ...selectedSites, selectedSite ] );
		}
	}

	if ( data?.sites ) {
		data.sites = data.sites.map( ( site: Site ) => {
			return {
				...site,
				isSelected: selectedSiteIds.includes( site.blog_id ),
				onSelect: () => handleSetSelectedSites( site ),
			};
		} );
	}

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

	let emptyState;
	if ( showEmptyState ) {
		emptyState = <OnboardingWidget />;
		if ( filter.showOnlyFavorites ) {
			emptyState = translate( "You don't have any favorites yet." );
		}
		if ( hasAppliedFilter ) {
			emptyState = translate( 'No results found. Please try refining your search.' );
		}
	}

	const isFavoritesTab = selectedTab.key === 'favorites';

	const issueLicenseRedirectUrl = useMemo( () => {
		return addQueryArgs( `/partner-portal/issue-license/`, {
			site_id: selectedLicensesSiteId,
			product_slug: selectedLicenses
				?.map( ( type: string ) => getProductSlugFromProductType( type ) )
				// If multiple products are selected, pass them as a comma-separated list.
				.join( ',' ),
			source: 'dashboard',
		} );
	}, [ selectedLicensesSiteId, selectedLicenses ] );

	const [ divRef, hasCrossed ] = useDetectWindowBoundary( CALYPSO_MASTERBAR_HEIGHT );

	const outerDivProps = divRef ? { ref: divRef as React.RefObject< HTMLDivElement > } : {};

	const renderIssueLicenseButton = () => {
		return (
			<div className="sites-overview__licenses-buttons">
				<Button
					borderless
					className="sites-overview__licenses-buttons-cancel"
					onClick={ () => dispatch( resetSite() ) }
				>
					{ translate( 'Cancel', { context: 'button label' } ) }
				</Button>
				<Button
					primary
					className="sites-overview__licenses-buttons-issue-license"
					href={ issueLicenseRedirectUrl }
					onClick={ () =>
						dispatch(
							recordTracksEvent( 'calypso_jetpack_agency_dashboard_licenses_select', {
								site_id: selectedLicensesSiteId,
								products: selectedLicenses
									?.map( ( type: string ) => getProductSlugFromProductType( type ) )
									// If multiple products are selected, pass them as a comma-separated list.
									.join( ',' ),
							} )
						)
					}
				>
					{ translate( 'Issue %(numLicenses)d license', 'Issue %(numLicenses)d licenses', {
						context: 'button label',
						count: selectedLicensesCount,
						args: {
							numLicenses: selectedLicensesCount,
						},
					} ) }
				</Button>
			</div>
		);
	};

	const showIssueLicenseButtonsLargeScreen =
		isWithinBreakpoint( '>960px' ) && selectedLicensesCount > 0;

	return (
		<div className="sites-overview">
			<DocumentHead title={ pageTitle } />
			<SidebarNavigation sectionTitle={ pageTitle } />
			<div className="sites-overview__container">
				<div className="sites-overview__tabs">
					<div className="sites-overview__content-wrapper">
						<SiteWelcomeBanner isDashboardView />
						{ data?.sites && <SiteAddLicenseNotification /> }
						<div className="sites-overview__viewport" { ...outerDivProps }>
							<div
								className={ classNames( 'sites-overview__page-title-container', {
									'is-sticky': showIssueLicenseButtonsLargeScreen && hasCrossed,
								} ) }
							>
								<div className="sites-overview__page-heading">
									<h2 className="sites-overview__page-title">{ pageTitle }</h2>
									<div className="sites-overview__page-subtitle">
										{ translate( 'Manage all your Jetpack sites from one location' ) }
									</div>
								</div>

								{ showIssueLicenseButtonsLargeScreen && renderIssueLicenseButton() }
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
							<div className="sites-overview__no-sites">{ emptyState }</div>
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
			{ isWithinBreakpoint( '<960px' ) && selectedLicensesCount > 0 && (
				<div className="sites-overview__issue-licenses-button-small-screen">
					{ renderIssueLicenseButton() }
				</div>
			) }
		</div>
	);
}
