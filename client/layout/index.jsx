import config from '@automattic/calypso-config';
import { isWithinBreakpoint, subscribeIsWithinBreakpoint } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { UniversalNavbarHeader } from '@automattic/wpcom-template-parts';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component, useEffect } from 'react';
import { connect } from 'react-redux';
import QueryAgencies from 'calypso/a8c-for-agencies/data/agencies/query-agencies';
import AsyncLoad from 'calypso/components/async-load';
import DocumentHead from 'calypso/components/data/document-head';
import QueryPreferences from 'calypso/components/data/query-preferences';
import QuerySiteAdminColor from 'calypso/components/data/query-site-admin-color';
import QuerySiteAdminMenu from 'calypso/components/data/query-site-admin-menu';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySites from 'calypso/components/data/query-sites';
import JetpackCloudMasterbar from 'calypso/components/jetpack/masterbar';
import { withCurrentRoute } from 'calypso/components/route';
import SympathyDevWarning from 'calypso/components/sympathy-dev-warning';
import { getDashboardFromHostname } from 'calypso/dashboard/app/routing';
import { retrieveMobileRedirect } from 'calypso/jetpack-connect/persistence-utils';
import { installKonamiListener } from 'calypso/layout/arcade-mode/detect';
import EmptyMasterbar from 'calypso/layout/masterbar/empty';
import MasterbarLoggedIn from 'calypso/layout/masterbar/logged-in';
import { isInStepContainerV2FlowContext } from 'calypso/layout/utils';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import { ClassicColorSchemeProvider, withColorScheme } from 'calypso/lib/color-scheme';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isWcMobileApp, isWpMobileApp } from 'calypso/lib/mobile-app';
import {
	isWooOAuth2Client,
	isJetpackCloudOAuth2Client,
	isA4AOAuth2Client,
	isCrowdsignalOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import isReaderTagEmbedPage from 'calypso/lib/reader/is-reader-tag-embed-page';
import { getMessagePathForJITM } from 'calypso/lib/route';
import UserVerificationChecker from 'calypso/lib/user/verification-checker';
import PluginCompassAgentLoader from 'calypso/my-sites/plugins/plugin-compass-agent-loader';
import { isFetchingAdminColor } from 'calypso/state/admin-color/selectors';
import { loadTrackingTool } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { hasDashboardOptIn } from 'calypso/state/dashboard/selectors';
import { getSidebarType, SidebarType } from 'calypso/state/global-sidebar/selectors';
import { isUserNewerThan, WEEK_IN_MILLISECONDS } from 'calypso/state/guided-tours/contexts';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import { isReaderMSDEnabled } from 'calypso/state/reader-ui/selectors';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getPrimarySiteId from 'calypso/state/selectors/get-primary-site-id';
import hasGravatarDomainQueryParam from 'calypso/state/selectors/has-gravatar-domain-query-param';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import { getIsOnboardingAffiliateFlow } from 'calypso/state/signup/flow/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getSite from 'calypso/state/sites/selectors/get-site';
import { isSupportSession } from 'calypso/state/support/selectors';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import {
	getMostRecentlySelectedSiteId,
	getSelectedSiteId,
	getSidebarIsCollapsed,
	masterbarIsVisible,
} from 'calypso/state/ui/selectors';
import AgentsManagerLoader from './agents-manager-loader';
import BodySectionCssClass from './body-section-css-class';
import { getColorScheme, getColorSchemeFromCurrentQuery, refreshColorScheme } from './color-scheme';
import HelpCenterLoader from './help-center-loader';
import LayoutLoader from './loader';
import { shouldLoadInlineHelp, handleScroll } from './utils';

/*
 * Hotfix for card and button styles hierarchy after <GdprBanner /> removal (see: #70601)
 * TODO: Find a way to improve our async loading that will not require these imports in the global scope (context: pbNhbs-4xL-p2)
 */
import '@automattic/components/src/button/style.scss';
import '@automattic/components/src/card/style.scss';

import 'calypso/reader/color-scheme/dark-mode.scss';
import './style.scss';

const loadWooCoreProfiler = () =>
	import(
		/* webpackChunkName: "async-load-calypso-layout-masterbar-woo-core-profiler" */ 'calypso/layout/masterbar/woo-core-profiler'
	);
const loadBlazePro = () =>
	import(
		/* webpackChunkName: "async-load-calypso-layout-masterbar-blaze-pro" */ 'calypso/layout/masterbar/blaze-pro'
	);
const loadReaderHeader = () =>
	import(
		/* webpackChunkName: "async-load-calypso-reader-components-header" */ 'calypso/reader/components/header'
	);
const loadCelebrateSiteLaunchModal = () =>
	import(
		/* webpackChunkName: "async-load-calypso-my-sites-customer-home-celebrate-site-launch-modal" */ 'calypso/my-sites/customer-home/celebrate-site-launch-modal'
	);
const loadGuidedTours = () =>
	import(
		/* webpackChunkName: "async-load-calypso-layout-guided-tours" */ 'calypso/layout/guided-tours'
	);
const loadJetpackCloudStyle = () =>
	import(
		/* webpackChunkName: "async-load-calypso-jetpack-cloud-style" */ 'calypso/jetpack-cloud/style'
	);
const loadA8cForAgenciesStyle = () =>
	import(
		/* webpackChunkName: "async-load-calypso-a8c-for-agencies-style" */ 'calypso/a8c-for-agencies/style'
	);
const loadJitm = () =>
	import( /* webpackChunkName: "async-load-calypso-blocks-jitm" */ 'calypso/blocks/jitm' );
const loadGlobalNotices = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-global-notices" */ 'calypso/components/global-notices'
	);
const loadCommunityTranslator = () =>
	import(
		/* webpackChunkName: "async-load-calypso-layout-community-translator" */ 'calypso/layout/community-translator'
	);
const loadWebpackBuildMonitor = () =>
	import(
		/* webpackChunkName: "async-load-calypso-components-webpack-build-monitor" */ 'calypso/components/webpack-build-monitor'
	);
const loadSupportArticleDialog = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-support-article-dialog" */ 'calypso/blocks/support-article-dialog'
	);
const loadCookieBanner = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-cookie-banner" */ 'calypso/blocks/cookie-banner'
	);
const loadAppBanner = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-app-banner" */ 'calypso/blocks/app-banner'
	);
const loadLegalUpdatesBanner = () =>
	import(
		/* webpackChunkName: "async-load-calypso-blocks-legal-updates-banner" */ 'calypso/blocks/legal-updates-banner'
	);
const loadGlobalNotifications = () =>
	import(
		/* webpackChunkName: "async-load-calypso-layout-global-notifications" */ 'calypso/layout/global-notifications'
	);

const READER_DARK_MODE_BODY_CLASS = 'is-reader-dark-mode';

function SidebarScrollSynchronizer() {
	const isNarrow = useBreakpoint( '<660px' );
	const active = ! isNarrow && ! config.isEnabled( 'jetpack-cloud' ); // Jetpack cloud hasn't yet aligned with WPCOM.

	useEffect( () => {
		if ( active ) {
			window.addEventListener( 'scroll', handleScroll );
			window.addEventListener( 'resize', handleScroll );
		}

		return () => {
			if ( active ) {
				window.removeEventListener( 'scroll', handleScroll );
				window.removeEventListener( 'resize', handleScroll );

				// remove style attributes added by `handleScroll`
				document.getElementById( 'content' )?.removeAttribute( 'style' );
				document.getElementById( 'secondary' )?.removeAttribute( 'style' );
			}
		};
	}, [ active ] );

	return null;
}

function SidebarOverflowDelay( { layoutFocus } ) {
	const setSidebarOverflowClass = ( overflow ) => {
		const classList = document.querySelector( 'body' ).classList;
		if ( overflow ) {
			classList.add( 'is-sidebar-overflow' );
		} else {
			classList.remove( 'is-sidebar-overflow' );
		}
	};

	useEffect( () => {
		if ( layoutFocus !== 'sites' ) {
			// The sidebar menu uses a flyout design that requires the overflowing content
			// to be visible. However, `overflow` isn't an animatable CSS property, so we
			// need to set it after the sliding transition finishes. We wait for 150ms (the
			// CSS transition time) + a grace period of 350ms (since the sidebar menu is
			// rendered asynchronously).
			// @see https://github.com/Automattic/wp-calypso/issues/47019
			setTimeout( () => {
				setSidebarOverflowClass( true );
			}, 500 );
		} else {
			setSidebarOverflowClass( false );
		}
	}, [ layoutFocus ] );

	return null;
}

class Layout extends Component {
	static propTypes = {
		primary: PropTypes.element,
		secondary: PropTypes.element,
		beforePrimary: PropTypes.element,
		focus: PropTypes.object,
		// connected props
		masterbarIsHidden: PropTypes.bool,
		isSupportSession: PropTypes.bool,
		sectionGroup: PropTypes.string,
		sectionName: PropTypes.string,
		colorScheme: PropTypes.string,
		isGravatarDomain: PropTypes.bool,
	};

	constructor( props ) {
		super( props );
		this.state = {
			isDesktop: isWithinBreakpoint( '>=782px' ),
			initiallyUnlaunchedSite: false,
		};
	}

	componentDidMount() {
		this.unsubscribe = subscribeIsWithinBreakpoint( '>=782px', ( isDesktop ) => {
			this.setState( { isDesktop } );
		} );

		refreshColorScheme( undefined, this.props.colorScheme );

		// Load Survicate survey on all pages when the user is logged in
		if ( this.props.isLoggedIn ) {
			this.props.dispatch( loadTrackingTool( 'Survicate' ) );
		}

		if ( ! isJetpackCloud() && ! isA8CForAgencies() ) {
			installKonamiListener();
		}
	}

	componentDidUpdate( prevProps ) {
		refreshColorScheme( prevProps.colorScheme, this.props.colorScheme );
	}

	static getDerivedStateFromProps( props ) {
		if ( props.site?.launch_status === 'unlaunched' ) {
			return {
				initiallyUnlaunchedSite: true,
			};
		}
		return null;
	}

	renderMasterbar( loadHelpCenterIcon ) {
		if ( this.props.masterbarIsHidden ) {
			return <EmptyMasterbar />;
		}
		if ( this.props.isWooJPC ) {
			return <AsyncLoad require={ loadWooCoreProfiler } placeholder={ null } />;
		}
		if ( this.props.isBlazePro ) {
			return <AsyncLoad require={ loadBlazePro } placeholder={ null } />;
		}

		if ( this.props.needsColorScheme && this.props.isFetchingColorScheme ) {
			return null;
		}

		if ( this.props.isMSDEnabledForReader ) {
			return <AsyncLoad require={ loadReaderHeader } placeholder={ null } />;
		}

		const MasterbarComponent = config.isEnabled( 'jetpack-cloud' )
			? JetpackCloudMasterbar
			: MasterbarLoggedIn;

		const isCheckoutFailed =
			this.props.sectionName === 'checkout' &&
			this.props.currentRoute.startsWith( '/checkout/failed-purchases' );

		return (
			<>
				{ this.props.hasUniversalHeader && (
					<UniversalNavbarHeader
						isLoggedIn={ this.props.isLoggedIn }
						sectionName={ this.props.sectionName }
					/>
				) }
				<MasterbarComponent
					siteId={ this.props.siteIdForLaunch }
					section={ this.props.sectionGroup }
					isCheckout={ this.props.sectionName === 'checkout' }
					isCheckoutPending={ this.props.sectionName === 'checkout-pending' }
					isCheckoutFailed={ isCheckoutFailed }
					loadHelpCenterIcon={ loadHelpCenterIcon }
					isGlobalSidebarVisible={ this.props.isGlobalSidebarVisible }
				/>
			</>
		);
	}

	renderCelebrateSiteLaunchModal() {
		if ( ! this.state.initiallyUnlaunchedSite && ! this.props.hasCelebrateLaunchQueryParam ) {
			return null;
		}

		return (
			<AsyncLoad
				require={ loadCelebrateSiteLaunchModal }
				placeholder={ null }
				siteId={ this.props.siteIdForLaunch }
			/>
		);
	}

	render() {
		const sectionClass = clsx( 'layout', `focus-${ this.props.currentLayoutFocus }`, {
			[ 'is-group-' + this.props.sectionGroup ]: this.props.sectionGroup,
			[ 'is-section-' + this.props.sectionName ]: this.props.sectionName,
			'a8c-for-agencies': isA4AOAuth2Client( this.props.oauth2Client ),
			crowdsignal: isCrowdsignalOAuth2Client( this.props.oauth2Client ),
			'is-support-session': this.props.isSupportSession,
			'has-no-sidebar': this.props.sidebarIsHidden,
			'has-no-masterbar': this.props.masterbarIsHidden,
			'has-universal-header': this.props.hasUniversalHeader,
			'is-logged-in': this.props.isLoggedIn,
			'is-jetpack-login': this.props.isJetpackLogin,
			'is-jetpack-site': this.props.isJetpack,
			'is-jetpack-mobile-flow': this.props.isJetpackMobileFlow,
			'is-woocommerce-core-profiler-flow': this.props.isWooJPC,
			'is-automattic-for-agencies-flow': this.props.isFromAutomatticForAgenciesPlugin,
			woo: this.props.isWooJPC,
			'is-global-sidebar-visible': this.props.isGlobalSidebarVisible,
			'is-global-sidebar-collapsed': this.props.isGlobalSidebarCollapsed,
			'is-unified-site-sidebar-visible': this.props.isUnifiedSiteSidebarVisible,
			'is-blaze-pro': this.props.isBlazePro,
			'is-woo-com-oauth': isWooOAuth2Client( this.props.oauth2Client ),
			'jetpack-cloud': isJetpackCloudOAuth2Client( this.props.oauth2Client ),
			'feature-flag-woocommerce-core-profiler-passwordless-auth': true,
			'is-domain-for-gravatar': this.props.isGravatarDomain,
			'is-reader-msd-enabled': this.props.isMSDEnabledForReader,
		} );

		const optionalBodyProps = () => {
			const bodyClass = [ 'font-smoothing-antialiased' ];

			if ( this.props.sidebarIsCollapsed && isWithinBreakpoint( '>800px' ) ) {
				bodyClass.push( 'is-sidebar-collapsed' );
			}

			return {
				bodyClass,
			};
		};

		const loadHelpCenter =
			// we want to show only the Help center in my home and the help section (but not the FAB)
			( [ 'home', 'help' ].includes( this.props.sectionName ) ||
				shouldLoadInlineHelp( this.props.sectionName, this.props.currentRoute ) ) &&
			this.props.userAllowedToHelpCenter;

		const loadAgentsManager =
			[ 'home', 'help' ].includes( this.props.sectionName ) ||
			shouldLoadInlineHelp( this.props.sectionName, this.props.currentRoute );

		const shouldDisableSidebarScrollSynchronizer =
			this.props.isGlobalSidebarVisible || this.props.isGlobalSidebarCollapsed;

		return (
			<div className={ sectionClass }>
				<HelpCenterLoader
					sectionName={ this.props.sectionName }
					loadHelpCenter={ loadHelpCenter }
					currentRoute={ this.props.currentRoute }
				/>
				<AgentsManagerLoader
					sectionName={ this.props.sectionName }
					loadAgentsManager={ loadAgentsManager }
				/>
				<PluginCompassAgentLoader sectionName={ this.props.sectionName } />
				{ ! shouldDisableSidebarScrollSynchronizer && (
					<SidebarScrollSynchronizer layoutFocus={ this.props.currentLayoutFocus } />
				) }
				<SidebarOverflowDelay layoutFocus={ this.props.currentLayoutFocus } />
				<BodySectionCssClass
					layoutFocus={ this.props.currentLayoutFocus }
					group={ this.props.sectionGroup }
					section={ this.props.sectionName }
					{ ...optionalBodyProps() }
				/>
				<DocumentHead />
				{ this.props.shouldQueryAllSites ? (
					<QuerySites allSites />
				) : (
					<QuerySites primaryAndRecent={ ! config.isEnabled( 'jetpack-cloud' ) } />
				) }
				<QueryPreferences />
				{ withColorScheme( null, {
					bodyClass: READER_DARK_MODE_BODY_CLASS,
					enabled: this.props.sectionName === 'reader' && this.props.isLoggedIn,
					Provider: ClassicColorSchemeProvider,
				} ) }
				<QuerySiteFeatures siteIds={ [ this.props.siteId ] } />
				<QuerySiteAdminMenu siteId={ this.props.siteId } />
				<QuerySiteAdminColor siteId={ this.props.siteId } />
				<UserVerificationChecker />
				{ config.isEnabled( 'layout/guided-tours' ) && (
					<AsyncLoad require={ loadGuidedTours } placeholder={ null } />
				) }
				<div className="layout__header-section">{ this.renderMasterbar( loadHelpCenter ) }</div>
				<LayoutLoader />
				{ isJetpackCloud() && <AsyncLoad require={ loadJetpackCloudStyle } placeholder={ null } /> }
				{ isA8CForAgencies() && (
					<>
						<AsyncLoad require={ loadA8cForAgenciesStyle } placeholder={ null } />
						<QueryAgencies />
					</>
				) }
				<div id="content" className="layout__content">
					{ config.isEnabled( 'jitms' ) && this.props.isEligibleForJITM && (
						<AsyncLoad
							require={ loadJitm }
							placeholder={ null }
							messagePath={ `calypso:${ this.props.sectionJitmPath }:admin_notices` }
						/>
					) }
					<AsyncLoad require={ loadGlobalNotices } placeholder={ null } id="notices" />
					{ ! ( this.props.needsColorScheme && this.props.isFetchingColorScheme ) && (
						<>
							<div id="secondary" className="layout__secondary" role="navigation">
								{ this.props.secondary }
							</div>
							{ this.props.beforePrimary }
							<div id="primary" className="layout__primary">
								{ this.props.primary }
							</div>
						</>
					) }
				</div>
				<AsyncLoad require={ loadCommunityTranslator } placeholder={ null } />
				{ 'development' === process.env.NODE_ENV && (
					<>
						<SympathyDevWarning />
						<AsyncLoad require={ loadWebpackBuildMonitor } placeholder={ null } />
					</>
				) }
				{ config.isEnabled( 'layout/support-article-dialog' ) && (
					<AsyncLoad require={ loadSupportArticleDialog } placeholder={ null } />
				) }
				{ config.isEnabled( 'cookie-banner' ) && (
					<AsyncLoad require={ loadCookieBanner } placeholder={ null } />
				) }
				{ config.isEnabled( 'layout/app-banner' ) && (
					<AsyncLoad require={ loadAppBanner } placeholder={ null } />
				) }
				{ config.isEnabled( 'legal-updates-banner' ) && (
					<AsyncLoad require={ loadLegalUpdatesBanner } placeholder={ null } />
				) }

				{ ! this.props.isMSDEnabledForReader && (
					<AsyncLoad require={ loadGlobalNotifications } placeholder={ null } />
				) }
				{ this.renderCelebrateSiteLaunchModal() }
			</div>
		);
	}
}

export default withCurrentRoute(
	connect( ( state, { currentSection, currentRoute, currentQuery, secondary } ) => {
		const dashboard = getDashboardFromHostname( window?.location?.hostname );
		const sectionGroup = currentSection?.group ?? null;
		const sectionName = currentSection?.name ?? null;

		const siteId = getSelectedSiteId( state );
		// Falls back to using the user's primary site if no site has been selected
		// by the user yet. Only consumed by the masterbar launch button and the
		// site launch celebration modal — other layout logic (sidebar type,
		// universal header, color scheme, jetpack detection) must keep using the
		// actually-selected site.
		const siteIdForLaunch =
			siteId || getMostRecentlySelectedSiteId( state ) || getPrimarySiteId( state );
		const sectionJitmPath = getMessagePathForJITM( currentRoute );
		const isJetpackLogin = currentRoute.startsWith( '/log-in/jetpack' );
		const isJetpack =
			( isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) ) ||
			currentRoute.startsWith( '/checkout/jetpack' );
		const isWooJPC =
			[ 'jetpack-connect', 'login' ].includes( sectionName ) && isWooJPCFlow( state );
		const isBlazePro = getIsBlazePro( state );
		const isMSDEnabledForReader = currentSection?.name === 'reader' && isReaderMSDEnabled( state );

		const sidebarType = getSidebarType( {
			state,
			siteId,
			section: currentSection,
			route: currentRoute,
		} );

		const shouldShowGlobalSidebar =
			sidebarType === SidebarType.Global || sidebarType === SidebarType.GlobalCollapsed;
		const shouldShowCollapsedGlobalSidebar = sidebarType === SidebarType.GlobalCollapsed;
		const shouldShowUnifiedSiteSidebar = sidebarType === SidebarType.UnifiedSiteClassic;

		const isCheckoutSection = [ 'checkout', 'checkout-pending', 'checkout-thank-you' ].includes(
			sectionName
		);

		const noMasterbarForRoute =
			isJetpackLogin ||
			currentRoute === '/me/account/closed' ||
			isReaderTagEmbedPage( window?.location );
		const noMasterbarForSection =
			// hide the masterBar until the section is loaded. To flicker the masterBar in, is better than to flicker it out.
			! sectionName ||
			( dashboard === 'ciab' && isCheckoutSection ) ||
			( ! isWooJPC && ! isBlazePro && [ 'signup', 'jetpack-connect' ].includes( sectionName ) );
		const isFromAutomatticForAgenciesPlugin =
			'automattic-for-agencies-client' === currentQuery?.from;
		const masterbarIsHidden =
			! masterbarIsVisible( state ) ||
			noMasterbarForSection ||
			noMasterbarForRoute ||
			isWpMobileApp() ||
			isWcMobileApp() ||
			isJetpackCloud() ||
			isA8CForAgencies() ||
			isInStepContainerV2FlowContext( currentRoute, currentQuery );
		const isJetpackMobileFlow = 'jetpack-connect' === sectionName && !! retrieveMobileRedirect();
		const oauth2Client = getCurrentOAuth2Client( state );
		const wccomFrom = currentQuery?.[ 'wccom-from' ];
		const isEligibleForJITM = [ 'home', 'plans', 'themes', 'plugins', 'comments' ].includes(
			sectionName
		);
		const sidebarIsHidden = ! secondary || isWcMobileApp();
		const isGlobalSidebarVisible = shouldShowGlobalSidebar && ! sidebarIsHidden;

		const colorScheme = isWooJPC
			? getColorSchemeFromCurrentQuery( currentQuery )
			: getColorScheme( {
					state,
					isGlobalSidebarVisible,
					sidebarIsHidden,
					sectionName,
			  } );
		const needsColorScheme =
			! sidebarIsHidden &&
			( sidebarType === SidebarType.UnifiedSiteDefault ||
				sidebarType === SidebarType.UnifiedSiteClassic );

		const isGravatarDomain =
			currentRoute.startsWith( '/start/domain-for-gravatar' ) ||
			( isCheckoutSection && hasGravatarDomainQueryParam( state ) );

		const dashboardOptIn = hasDashboardOptIn( state );

		const isEnabledThemeUniversalHeader =
			config.isEnabled( 'themes/universal-header' ) &&
			[ 'themes', 'theme' ].includes( sectionName );

		const isLoggedIn = isUserLoggedIn( state );

		const isEnabledPluginsUniversalHeader =
			config.isEnabled( 'plugins/universal-header' ) &&
			[ 'plugins' ].includes( sectionName ) &&
			! (
				currentRoute.startsWith( '/plugins/manage' ) ||
				currentRoute.startsWith( '/plugins/scheduled-updates' )
			) &&
			// When marketplace-redesign is enabled, only show universal header for logged out users.
			( ! config.isEnabled( 'marketplace-redesign' ) || ! isLoggedIn );

		const hasUniversalHeader =
			dashboardOptIn &&
			! siteId &&
			( isEnabledThemeUniversalHeader || isEnabledPluginsUniversalHeader );

		return {
			masterbarIsHidden,
			sidebarIsHidden,
			isJetpack,
			isJetpackLogin,
			isJetpackMobileFlow,
			isWooJPC,
			isFromAutomatticForAgenciesPlugin,
			isEligibleForJITM,
			isBlazePro,
			isMSDEnabledForReader,
			oauth2Client,
			wccomFrom,
			isLoggedIn,
			isSupportSession: isSupportSession( state ),
			sectionGroup,
			sectionName,
			sectionJitmPath,
			hasCelebrateLaunchQueryParam: getInitialQueryArguments( state )?.celebrateLaunch === 'true',
			currentLayoutFocus: getCurrentLayoutFocus( state ),
			colorScheme,
			needsColorScheme,
			isFetchingColorScheme: isFetchingAdminColor( state, siteId ),
			siteId,
			siteIdForLaunch,
			site: getSite( state, siteIdForLaunch ),
			// We avoid requesting sites in the Jetpack Connect authorization step, because this would
			// request all sites before authorization has finished. That would cause the "all sites"
			// request to lack the newly authorized site, and when the request finishes after
			// authorization, it would remove the newly connected site that has been fetched separately.
			// See https://github.com/Automattic/wp-calypso/pull/31277 for more details.
			shouldQueryAllSites: currentRoute && currentRoute !== '/jetpack/connect/authorize',
			sidebarIsCollapsed: sectionName !== 'reader' && getSidebarIsCollapsed( state ),
			userAllowedToHelpCenter: ! getIsOnboardingAffiliateFlow( state ),
			currentRoute,
			isGlobalSidebarVisible,
			isGlobalSidebarCollapsed: shouldShowCollapsedGlobalSidebar && ! sidebarIsHidden,
			isUnifiedSiteSidebarVisible: shouldShowUnifiedSiteSidebar && ! sidebarIsHidden,
			isNewUser: isUserNewerThan( WEEK_IN_MILLISECONDS )( state ),
			isGravatarDomain,
			hasUniversalHeader,
		};
	} )( Layout )
);
