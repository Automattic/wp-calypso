import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { isWithinBreakpoint } from '@automattic/viewport';
import { getQueryArg, removeQueryArgs, addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Notice from 'calypso/components/notice';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
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
import { getIsPartnerOAuthTokenLoaded } from 'calypso/state/partner-portal/partner/selectors';
import { serializeQueryStringProducts } from '../../partner-portal/lib/querystring-products';
import SitesOverviewContext from './context';
import DashboardBanners from './dashboard-banners';
import useQueryProvisioningBlogIds from './hooks/use-query-provisioning-blog-ids';
import { DASHBOARD_PRODUCT_SLUGS_BY_TYPE } from './lib/constants';
import SiteAddLicenseNotification from './site-add-license-notification';
import SiteContentHeader from './site-content-header';
import SiteNotifications from './site-notifications';
import SiteTopHeaderButtons from './site-top-header-buttons';
import SitesDataViews from './sites-dataviews';
import { SitesViewState } from './sites-dataviews/interfaces';

import './style.scss';

const QUERY_PARAM_PROVISIONING = 'provisioning';

export default function SitesDashboardV2() {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const jetpackSiteDisconnected = useSelector( checkIfJetpackSiteGotDisconnected );
	const isPartnerOAuthTokenLoaded = useSelector( getIsPartnerOAuthTokenLoaded );

	const selectedLicenses = useSelector( getSelectedLicenses );
	const selectedSiteLicenses = useSelector( getSelectedSiteLicenses );
	const selectedLicensesSiteId = useSelector( getSelectedLicensesSiteId );

	const isStreamlinedPurchasesEnabled = isEnabled( 'jetpack/streamline-license-purchases' );

	const selectedLicensesCount = isStreamlinedPurchasesEnabled
		? selectedSiteLicenses.reduce( ( acc, { products } ) => acc + products.length, 0 )
		: selectedLicenses?.length;

	const {
		search,
		currentPage,
		filter,
		sort,
		// TODO - These props will be used when we implement the bulk management:
		// selectedSites,
		// setSelectedSites,
		// setIsBulkManagementActive,
	} = useContext( SitesOverviewContext );

	const [ sitesViewState, setSitesViewState ] = useState< SitesViewState >( {
		type: 'table',
		perPage: 50,
		page: currentPage,
		sort: {
			field: 'site',
			direction: 'desc',
		},
		search: search,
		filters: [],
		hiddenFields: [ 'status' ],
		layout: {},
		selectedSite: undefined,
	} );

	const { data, isError, isLoading, refetch } = useFetchDashboardSites(
		isPartnerOAuthTokenLoaded,
		sitesViewState.search,
		sitesViewState.page,
		filter,
		sort
	);

	const onSitesViewChange = useCallback(
		( sitesViewData: SitesViewState ) => {
			setSitesViewState( sitesViewData );
		},
		[ setSitesViewState, sitesViewState ]
	);

	// Parse query string to get selected filter value
	useEffect( () => {
		const params = new URLSearchParams( window.location.search );
		const selectedFilter = parseInt( params.get( 'selectedFilter' ) ?? '0' );
		if ( selectedFilter ) {
			setSitesViewState( ( prevView ) => ( {
				...prevView,
				filters: [ { field: 'status', operator: 'in', value: selectedFilter } ],
			} ) );
		}
	}, [] );

	useEffect( () => {
		const arrayMap = [
			'?issue_type=all_isues',
			'/favorites',
			'?issue_type=backup_failed',
			'?issue_type=backup_warning',
			'?issue_type=threats_found',
			'?issue_type=site_disconnected',
			'?issue_type=site_down',
			'?issue_type=plugin_updates',
		];
		// loop through the arrayMap and check that the filter value is not in the URL and the filter is selected,
		// before redirecting to the correct filter page.
		for ( let i = 0; i < arrayMap.length; i++ ) {
			if (
				! window.location.href.includes( arrayMap[ i ] ) &&
				sitesViewState.filters.some( ( filter ) => filter.value === i + 1 )
			) {
				if ( sitesViewState.filters.some( ( filter ) => filter.value === 2 ) ) {
					window.location.href = `/sites${ arrayMap[ i ] }?selectedFilter=${ i + 1 }`;
				} else {
					window.location.href = `/sites${ arrayMap[ i ] }&selectedFilter=${ i + 1 }`;
				}
			}
		}
		const resetButton = document.querySelector( '.dataviews-wrapper .is-tertiary' );
		if (
			! window.location.href.endsWith( 'sites' ) &&
			document.querySelector( '.dataviews-wrapper [aria-label="Status"]' ) === null
		) {
			if ( resetButton && resetButton.hasAttribute( 'aria-disabled' ) ) {
				window.location.href = '/sites';
			}
		}
	}, [ sitesViewState.filters ] );

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

	useEffect( () => {
		dispatch( recordTracksEvent( 'calypso_jetpack_agency_dashboard_visit' ) );
	}, [ dispatch ] );

	useEffect( () => {
		if ( isStreamlinedPurchasesEnabled ) {
			return () => {
				dispatch( resetSite() );
			};
		}
	}, [ isStreamlinedPurchasesEnabled, dispatch ] );

	const pageTitle = translate( 'Sites' );

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
					</div>
				</div>
				<div className="sites-overview__content">
					<SitesDataViews
						data={ data }
						isLoading={ isLoading }
						onSitesViewChange={ onSitesViewChange }
						sitesViewState={ sitesViewState }
					/>
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
