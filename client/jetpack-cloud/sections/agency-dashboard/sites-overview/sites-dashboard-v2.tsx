import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { isWithinBreakpoint } from '@automattic/viewport';
import { getQueryArg, removeQueryArgs, addQueryArgs } from '@wordpress/url';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Notice from 'calypso/components/notice';
import SidebarNavigation from 'calypso/components/sidebar-navigation';
import useFetchDashboardSites from 'calypso/data/agency-dashboard/use-fetch-dashboard-sites';
import useFetchMonitorVerfiedContacts from 'calypso/data/agency-dashboard/use-fetch-monitor-verified-contacts';
import {
	AgencyDashboardFilterMap,
	AgencyDashboardFilterOption,
} from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	resetSite,
	updateDashboardURLQueryArgs,
} from 'calypso/state/jetpack-agency-dashboard/actions';
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
import SitesOverviewContext from './context';
import DashboardBanners from './dashboard-banners';
import DashboardDataContext from './dashboard-data-context';
import useQueryProvisioningBlogIds from './hooks/use-query-provisioning-blog-ids';
import { DASHBOARD_PRODUCT_SLUGS_BY_TYPE } from './lib/constants';
import SiteAddLicenseNotification from './site-add-license-notification';
import SiteContentHeader from './site-content-header';
import { JetpackPreviewPane } from './site-feature-previews/jetpack-preview-pane';
import SiteNotifications from './site-notifications';
import SiteTopHeaderButtons from './site-top-header-buttons';
import SitesDataViews from './sites-dataviews';
import { SitesViewState } from './sites-dataviews/interfaces';

import './style.scss';
import './style-dashboard-v2.scss';

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

	const filtersMap: AgencyDashboardFilterMap[] = [
		{ filterType: 'all_issues', ref: 1 },
		{ filterType: 'backup_failed', ref: 2 },
		{ filterType: 'backup_warning', ref: 3 },
		{ filterType: 'threats_found', ref: 4 },
		{ filterType: 'site_disconnected', ref: 5 },
		{ filterType: 'site_down', ref: 6 },
		{ filterType: 'plugin_updates', ref: 7 },
	];

	const { path, search, currentPage, filter, sort } = useContext( SitesOverviewContext );

	const selectedFilters = filter?.issueTypes || [];

	const [ prevFilter, setPrevFilter ] = useState< AgencyDashboardFilterOption[] >( [] );

	const [ sitesViewState, setSitesViewState ] = useState< SitesViewState >( {
		type: 'table',
		perPage: 50,
		page: currentPage,
		sort: {
			field: 'site',
			direction: 'desc',
		},
		search: search,
		filters: selectedFilters.map( ( issueType ) => {
			const filterMapItem = filtersMap.find( ( filterMap ) => filterMap.filterType === issueType );
			const value = filterMapItem ? filterMapItem.ref : 1; // Default value if filter type not found
			return {
				field: 'status',
				operator: 'in',
				value: value,
			};
		} ),
		hiddenFields: [ 'status' ],
		layout: {},
		selectedSite: undefined,
	} );

	const { data, isError, isLoading, refetch } = useFetchDashboardSites(
		isPartnerOAuthTokenLoaded,
		search,
		currentPage,
		filter,
		sort
	);

	const onSitesViewChange = useCallback(
		( sitesViewData: SitesViewState ) => {
			setSitesViewState( sitesViewData );
		},
		[ setSitesViewState ]
	);

	const handleMultiSelect = ( combinedFilters: Array< unknown > ) => {
		const currentSelectedItem = document.body.querySelector(
			'.dataviews-wrapper .dataviews-filters__view-actions button:nth-of-type(2)'
		);
		if ( combinedFilters.length > 1 && currentSelectedItem ) {
			currentSelectedItem.classList.add( 'filter-multi-select-hide' );
		} else if ( document.querySelector( '.filter-multi-select-hide' ) && currentSelectedItem ) {
			currentSelectedItem.classList.remove( 'filter-multi-select-hide' );
		}
	};

	const componentsDropdownMenu = document.querySelector( '.components-dropdown-menu' );

	const removeMultiFilterClass = () => {
		for ( let i = 0; i < filtersMap.length; i++ ) {
			const number = filtersMap[ i ].ref;
			const newString = `.components-dropdown-menu div[role=menuitemradio]:nth-of-type(${ number })`;
			const childElement = document.body.querySelector( newString );
			if ( childElement ) {
				childElement.classList.remove( 'filter-dropdown-multi-select' );
			}
		}
	};

	// Filter selection
	useEffect( () => {
		const filtersSelected =
			sitesViewState.filters?.map( ( filter ) => {
				const filterType =
					filtersMap.find( ( filterMap ) => filterMap.ref === filter.value )?.filterType ||
					'all_issues';
				return filterType;
			} ) || [];

		// Logic to update prevFilter and combinedFilters
		let combinedFilters: AgencyDashboardFilterOption[] = [];
		if ( filtersSelected.length > 0 ) {
			combinedFilters = Array.from( new Set( [ ...prevFilter, ...filtersSelected ] ) );
			setPrevFilter( combinedFilters );
			if ( combinedFilters.length > 1 ) {
				handleMultiSelect( combinedFilters );
			}
		} else {
			// If no filters selected, reset prevFilter and combinedFilters
			removeMultiFilterClass();
			setPrevFilter( [] );
		}
		handleMultiSelect( combinedFilters );

		// Logic to update dashboard URL query args based on selected filters
		if ( filtersSelected.includes( 'all_issues' ) ) {
			updateDashboardURLQueryArgs( { filter: filtersSelected } );
			setPrevFilter( [] );
		} else {
			updateDashboardURLQueryArgs( { filter: combinedFilters } );
		}
	}, [ sitesViewState.filters, updateDashboardURLQueryArgs ] );

	// Update filter dropdown menu based on selected filters
	useEffect( () => {
		if ( componentsDropdownMenu && sitesViewState.filters[ 0 ]?.value !== undefined ) {
			const selectedFilters = [
				sitesViewState.filters[ 0 ].value,
				...prevFilter.map(
					( filterType ) =>
						filtersMap.find( ( filterMap ) => filterMap.filterType === filterType )?.ref || 1
				),
			];
			const needsAttention = document.body.querySelector(
				'.components-dropdown-menu div[role=menuitemradio]:nth-of-type(1)'
			);

			selectedFilters.forEach( ( number ) => {
				const newString = `.components-dropdown-menu div[role=menuitemradio]:nth-of-type(${ number })`;
				const childElement = document.body.querySelector( newString );
				if ( childElement ) {
					childElement.classList.add( 'filter-dropdown-multi-select' );
					if ( number !== 1 && needsAttention ) {
						needsAttention.classList.remove( 'filter-dropdown-multi-select' );
					}
				}
			} );

			if ( selectedFilters.includes( 1 ) ) {
				removeMultiFilterClass();
				const childElement = document.body.querySelector(
					'.components-dropdown-menu div[role=menuitemradio]:nth-of-type(1)'
				);
				childElement ? childElement.classList.add( 'filter-dropdown-multi-select' ) : null;
			} else if ( selectedFilters.length === 0 ) {
				removeMultiFilterClass();
			}
		}
	}, [ componentsDropdownMenu, sitesViewState.filters ] );

	// Search query
	useEffect( () => {
		updateDashboardURLQueryArgs( { search: sitesViewState.search } );
	}, [ sitesViewState.search ] );

	// Set or clear filter depending on sites submenu path selected
	useEffect( () => {
		if ( path === '/sites' || path === '/sites/favorites' ) {
			setPrevFilter( [] );
			setSitesViewState( { ...sitesViewState, filters: [], search: '' } );
		}
		if ( path === '/sites?issue_types=all_issues' ) {
			setPrevFilter( [] );
			setSitesViewState( {
				...sitesViewState,
				filters: [ { field: 'status', operator: 'in', value: 1 } ],
				search: '',
			} );
		}
	}, [ path ] );

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

	const { data: products } = useProductsQuery();

	const {
		data: verifiedContacts,
		refetch: refetchContacts,
		isError: fetchContactFailed,
	} = useFetchMonitorVerfiedContacts( isPartnerOAuthTokenLoaded );

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

	const closeSitePreviewPane = useCallback( () => {
		if ( sitesViewState.selectedSite ) {
			setSitesViewState( { ...sitesViewState, type: 'table', selectedSite: undefined } );
		}
	}, [ sitesViewState, setSitesViewState ] );

	return (
		<div
			className={ classNames(
				'sites-dashboard__layout',
				! sitesViewState.selectedSite && 'preview-hidden'
			) }
		>
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
								data={ data }
								isLoading={ isLoading }
								onSitesViewChange={ onSitesViewChange }
								sitesViewState={ sitesViewState }
							/>
						</DashboardDataContext.Provider>
					</div>
				</div>
				{ ! isLargeScreen && selectedLicensesCount > 0 && (
					<div className="sites-overview__issue-licenses-button-small-screen">
						{ renderIssueLicenseButton() }
					</div>
				) }
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
	);
}
