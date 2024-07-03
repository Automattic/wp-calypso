import { isEnabled } from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button, Count } from '@automattic/components';
import { isWithinBreakpoint } from '@automattic/viewport';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { getQueryArg, removeQueryArgs, addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useState, useMemo, createRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import Notice from 'calypso/components/notice';
import SectionNav from 'calypso/components/section-nav';
import NavItem from 'calypso/components/section-nav/item';
import NavTabs from 'calypso/components/section-nav/tabs';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import useFetchMonitorVerifiedContacts from 'calypso/data/agency-dashboard/use-fetch-monitor-verified-contacts';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { resetSite } from 'calypso/state/jetpack-agency-dashboard/actions';
import {
	checkIfJetpackSiteGotDisconnected,
	getSelectedLicenses,
	getSelectedLicensesSiteId,
	getSelectedSiteLicenses,
} from 'calypso/state/jetpack-agency-dashboard/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import useProductsQuery from 'calypso/state/partner-portal/licenses/hooks/use-products-query';
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import { serializeQueryStringProducts } from '../../partner-portal/lib/querystring-products';
import OnboardingWidget from '../../partner-portal/primary/onboarding-widget';
import SitesOverviewContext from './context';
import DashboardBanners from './dashboard-banners';
import DashboardDataContext from './dashboard-data-context';
import useQueryProvisioningBlogIds from './hooks/use-query-provisioning-blog-ids';
import { DASHBOARD_PRODUCT_SLUGS_BY_TYPE } from './lib/constants';
import SiteAddLicenseNotification from './site-add-license-notification';
import SiteContent from './site-content';
import useDashboardShowLargeScreen from './site-content/hooks/use-dashboard-show-large-screen';
import SiteContentHeader from './site-content-header';
import SiteNotifications from './site-notifications';
import SiteSearchFilterContainer from './site-search-filter-container/SiteSearchFilterContainer';
import SiteTopHeaderButtons from './site-top-header-buttons';
import type { Site } from '../sites-overview/types';

import './style.scss';

const QUERY_PARAM_PROVISIONING = 'provisioning';

export default function SitesOverview() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isMobile = useMobileBreakpoint();
	const jetpackSiteDisconnected = useSelector( checkIfJetpackSiteGotDisconnected );
	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );

	const containerRef = createRef< any >();
	const siteTableRef = createRef< HTMLTableElement >();

	const showLargeScreen = useDashboardShowLargeScreen( siteTableRef, containerRef );

	const selectedLicenses = useSelector( getSelectedLicenses );
	const selectedSiteLicenses = useSelector( getSelectedSiteLicenses );
	const selectedLicensesSiteId = useSelector( getSelectedLicensesSiteId );

	const isStreamlinedPurchasesEnabled = isEnabled( 'jetpack/streamline-license-purchases' );

	const selectedLicensesCount = isStreamlinedPurchasesEnabled
		? selectedSiteLicenses.reduce( ( acc, { products } ) => acc + products.length, 0 )
		: selectedLicenses?.length;

	const highlightFavoriteTab = getQueryArg( window.location.href, 'highlight' ) === 'favorite-tab';

	const [ highlightTab, setHighlightTab ] = useState( false );

	const {
		search,
		currentPage,
		filter,
		sort,
		selectedSites,
		setSelectedSites,
		setIsBulkManagementActive,
	} = useContext( SitesOverviewContext );

	const { data, isError, isLoading, refetch } = useFetchDashboardSites( {
		isPartnerOAuthTokenLoaded,
		searchQuery: search,
		currentPage,
		filter,
		sort,
	} );

	const {
		data: verifiedContacts,
		refetch: refetchContacts,
		isError: fetchContactFailed,
	} = useFetchMonitorVerifiedContacts( isPartnerOAuthTokenLoaded );

	const { data: products } = useProductsQuery();

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

	useEffect( () => {
		if ( isError ) {
			dispatch(
				errorNotice( translate( 'Failed to retrieve your sites. Please try again later.' ), {
					id: 'dashboard-sites-fetch-failure',
					duration: 5000,
				} )
			);
		}
	}, [ isError, translate, dispatch ] );

	useEffect( () => {
		if ( isStreamlinedPurchasesEnabled ) {
			return () => {
				dispatch( resetSite() );
			};
		}
	}, [ isStreamlinedPurchasesEnabled, dispatch ] );

	const pageTitle = translate( 'Sites' );

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
						setIsBulkManagementActive( false );
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
			setIsBulkManagementActive,
		]
	);

	const selectedTab = navItems.find( ( i ) => i.selected ) || navItems[ 0 ];
	const hasAppliedFilter = !! search || filter?.issueTypes?.length > 0;
	const showEmptyState = ! isLoading && ! isError && data?.sites?.length === 0;

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

	const selectedProducts = selectedLicenses?.map( ( type: string ) => ( {
		slug: DASHBOARD_PRODUCT_SLUGS_BY_TYPE[ type ],
		quantity: 1,
	} ) );

	const serializedLicenses = serializeQueryStringProducts( selectedProducts );

	const issueLicenseRedirectUrl = useMemo( () => {
		return addQueryArgs( `/partner-portal/issue-license/`, {
			site_id: selectedLicensesSiteId,
			products: serializedLicenses,
			source: 'dashboard',
		} );
	}, [ selectedLicensesSiteId, serializedLicenses ] );

	const handleIssueLicenses = () => {
		if ( isStreamlinedPurchasesEnabled ) {
			// TODO: Show a modal with the selected licenses and a button to issue them.
			return;
		}
		dispatch(
			recordTracksEvent( 'calypso_jetpack_agency_dashboard_licenses_select', {
				site_id: selectedLicensesSiteId,
				products: serializedLicenses,
			} )
		);
	};

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
					href={ isStreamlinedPurchasesEnabled ? undefined : issueLicenseRedirectUrl }
					onClick={ handleIssueLicenses }
				>
					{ isStreamlinedPurchasesEnabled
						? translate( 'Review %(numLicenses)d license', 'Review %(numLicenses)d licenses', {
								context: 'button label',
								count: selectedLicensesCount,
								args: {
									numLicenses: selectedLicensesCount,
								},
						  } )
						: translate( 'Issue %(numLicenses)d license', 'Issue %(numLicenses)d licenses', {
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

	const isLargeScreen = isWithinBreakpoint( '>960px' );

	const { data: provisioningBlogIds, isLoading: isLoadingProvisioningBlogIds } =
		useQueryProvisioningBlogIds();

	const [ hasDismissedProvisioningNotice, setHasDismissedProvisioningNotice ] =
		useState< boolean >( false );
	const isProvisioningSite =
		'true' === getQueryArg( window.location.href, QUERY_PARAM_PROVISIONING ) ||
		( ! isLoadingProvisioningBlogIds && Number( provisioningBlogIds?.length ) > 0 );

	const onDismissProvisioningNotice = () => {
		setHasDismissedProvisioningNotice( true );

		// Delete query param 'provisioning' from the URL.
		window.history.replaceState(
			null,
			'',
			removeQueryArgs( window.location.href, QUERY_PARAM_PROVISIONING )
		);
	};

	return (
		<div className="sites-overview">
			<DocumentHead title={ pageTitle } />
			<SidebarNavigation sectionTitle={ pageTitle } />
			<SiteNotifications />
			<div className="sites-overview__container">
				<div className="sites-overview__tabs">
					<div className="sites-overview__content-wrapper">
						<DashboardBanners />

						{ isProvisioningSite && ! hasDismissedProvisioningNotice && (
							<Notice status="is-info" onDismissClick={ onDismissProvisioningNotice }>
								{ translate(
									"We're setting up your new WordPress.com site and will notify you once it's ready, which should only take a few minutes."
								) }
							</Notice>
						) }
						{ data?.sites && <SiteAddLicenseNotification /> }
						<SiteContentHeader
							content={
								// render content only on large screens, The buttons for small screen have their own section
								isLargeScreen &&
								( selectedLicensesCount > 0 ? (
									renderIssueLicenseButton()
								) : (
									<SiteTopHeaderButtons />
								) )
							}
							pageTitle={ pageTitle }
							// Only renderIssueLicenseButton should be sticky.
							showStickyContent={ !! ( selectedLicensesCount > 0 && isLargeScreen ) }
						/>

						{
							// Render the add site and issue license buttons on mobile as a different component.
							! isLargeScreen && <SiteTopHeaderButtons />
						}
						<SectionNav
							applyUpdatedStyles
							selectedText={
								<span>
									{ selectedTab.label }
									<Count count={ selectedTab.count } compact />
								</span>
							}
							selectedCount={ selectedTab.count }
							className={ clsx(
								isMobile && highlightTab && isFavoritesTab && 'sites-overview__highlight-tab'
							) }
						>
							<NavTabs selectedText={ selectedTab.label } selectedCount={ selectedTab.count }>
								{ navItems.map( ( props ) => (
									<NavItem { ...props } compactCount />
								) ) }
							</NavTabs>
						</SectionNav>
					</div>
				</div>
				<div className="sites-overview__content">
					<div ref={ containerRef } className="sites-overview__content-wrapper">
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
									isLargeScreen: showLargeScreen,
								} }
							>
								<>
									<QueryProductsList type="jetpack" currency="USD" />
									<SiteContent
										data={ data }
										isLoading={ isLoading }
										currentPage={ currentPage }
										isFavoritesTab={ isFavoritesTab }
										ref={ siteTableRef }
									/>
								</>
							</DashboardDataContext.Provider>
						) }
					</div>
				</div>
			</div>
			{ ! isLargeScreen && selectedLicensesCount > 0 && (
				<div className="sites-overview__issue-licenses-button-small-screen">
					{ renderIssueLicenseButton() }
				</div>
			) }
		</div>
	);
}
