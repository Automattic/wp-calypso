/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { startsWith, flowRight as compose, some } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import AsyncLoad from 'calypso/components/async-load';
import MasterbarLoggedIn from 'calypso/layout/masterbar/logged-in';
import JetpackCloudMasterbar from 'calypso/components/jetpack/masterbar';
import EmptyMasterbar from 'calypso/layout/masterbar/empty';
import HtmlIsIframeClassname from 'calypso/layout/html-is-iframe-classname';
import config from '@automattic/calypso-config';
import OfflineStatus from 'calypso/layout/offline-status';
import QueryPreferences from 'calypso/components/data/query-preferences';
import QuerySites from 'calypso/components/data/query-sites';
import QuerySiteSelectedEditor from 'calypso/components/data/query-site-selected-editor';
import { isOffline } from 'calypso/state/application/selectors';
import {
	getSelectedSiteId,
	masterbarIsVisible,
	getSelectedSite,
	getSidebarIsCollapsed,
} from 'calypso/state/ui/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isHappychatOpen from 'calypso/state/happychat/selectors/is-happychat-open';
import hasActiveHappychatSession from 'calypso/state/happychat/selectors/has-active-happychat-session';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { isSupportSession } from 'calypso/state/support/selectors';
import SitePreview from 'calypso/blocks/site-preview';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import DocumentHead from 'calypso/components/data/document-head';
import { getPreference } from 'calypso/state/preferences/selectors';
import KeyboardShortcutsMenu from 'calypso/lib/keyboard-shortcuts/menu';
import SupportUser from 'calypso/support/support-user';
import isCommunityTranslatorEnabled from 'calypso/state/selectors/is-community-translator-enabled';
import { isE2ETest } from 'calypso/lib/e2e';
import { getMessagePathForJITM } from 'calypso/lib/route';
import BodySectionCssClass from './body-section-css-class';
import { retrieveMobileRedirect } from 'calypso/jetpack-connect/persistence-utils';
import { isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import LayoutLoader from './loader';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import { withCurrentRoute } from 'calypso/components/route';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { getShouldShowAppBanner, handleScroll } from './utils';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';
import { useBreakpoint } from '@automattic/viewport-react';
import { isWithinBreakpoint } from '@automattic/viewport';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Style dependencies
 */
// goofy import for environment badge, which is SSR'd
import 'calypso/components/environment-badge/style.scss';
import './style.scss';

function SidebarScrollSynchronizer( { enabled } ) {
	const isNarrow = useBreakpoint( '<660px' );
	const active = enabled && ! isNarrow && ! config.isEnabled( 'jetpack-cloud' ); // Jetpack cloud hasn't yet aligned with WPCOM.

	React.useEffect( () => {
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

	React.useEffect( () => {
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
		focus: PropTypes.object,
		// connected props
		masterbarIsHidden: PropTypes.bool,
		isSupportSession: PropTypes.bool,
		isOffline: PropTypes.bool,
		sectionGroup: PropTypes.string,
		sectionName: PropTypes.string,
		colorSchemePreference: PropTypes.string,
		shouldShowAppBanner: PropTypes.bool,
		shouldRequestReaderTeams: PropTypes.bool,
		useFontSmoothAntialiased: PropTypes.bool,
	};

	componentDidMount() {
		if ( ! config.isEnabled( 'me/account/color-scheme-picker' ) ) {
			return;
		}
		if ( typeof document !== 'undefined' ) {
			if ( this.props.colorSchemePreference ) {
				document
					.querySelector( 'body' )
					.classList.add( `is-${ this.props.colorSchemePreference }` );
			}
		}
	}

	componentDidUpdate( prevProps ) {
		if ( ! config.isEnabled( 'me/account/color-scheme-picker' ) ) {
			return;
		}
		if ( prevProps.colorSchemePreference === this.props.colorSchemePreference ) {
			return;
		}
		if ( typeof document !== 'undefined' ) {
			const classList = document.querySelector( 'body' ).classList;
			classList.remove( `is-${ prevProps.colorSchemePreference }` );
			classList.add( `is-${ this.props.colorSchemePreference }` );
		}

		// intentionally don't remove these in unmount
	}

	shouldShowHappyChatButton() {
		if ( ! config.isEnabled( 'happychat' ) ) {
			return false;
		}

		if ( isWpMobileApp() ) {
			return false;
		}

		if ( ! this.props.hasActiveHappyChat ) {
			return false;
		}

		const exemptedSections = [ 'happychat', 'devdocs' ];
		const exemptedRoutes = [ '/log-in/jetpack' ];
		const exemptedRoutesStartingWith = [ '/start/p2' ];

		return (
			! exemptedSections.includes( this.props.sectionName ) &&
			! exemptedRoutes.includes( this.props.currentRoute ) &&
			! some( exemptedRoutesStartingWith, ( startsWithString ) =>
				this.props.currentRoute?.startsWith( startsWithString )
			)
		);
	}

	shouldLoadInlineHelp() {
		if ( ! config.isEnabled( 'inline-help' ) ) {
			return false;
		}

		if ( isWpMobileApp() ) {
			return false;
		}

		const exemptedSections = [ 'jetpack-connect', 'happychat', 'devdocs', 'help', 'home' ];
		const exemptedRoutes = [ '/log-in/jetpack' ];
		const exemptedRoutesStartingWith = [
			'/start/p2',
			'/plugins/domain',
			'/plugins/marketplace/setup',
		];

		return (
			! exemptedSections.includes( this.props.sectionName ) &&
			! exemptedRoutes.includes( this.props.currentRoute ) &&
			! some( exemptedRoutesStartingWith, ( startsWithString ) =>
				this.props.currentRoute?.startsWith( startsWithString )
			)
		);
	}

	renderMasterbar() {
		if ( this.props.masterbarIsHidden ) {
			return <EmptyMasterbar />;
		}
		const MasterbarComponent = config.isEnabled( 'jetpack-cloud' )
			? JetpackCloudMasterbar
			: MasterbarLoggedIn;

		return (
			<MasterbarComponent
				section={ this.props.sectionGroup }
				isCheckout={ this.props.sectionName === 'checkout' }
			/>
		);
	}

	render() {
		const sectionClass = classnames( 'layout', `focus-${ this.props.currentLayoutFocus }`, {
			[ 'is-group-' + this.props.sectionGroup ]: this.props.sectionGroup,
			[ 'is-section-' + this.props.sectionName ]: this.props.sectionName,
			'is-support-session': this.props.isSupportSession,
			'has-no-sidebar': ! this.props.secondary,
			'is-inline-help-showing': this.shouldLoadInlineHelp(),
			'is-happychat-button-showing': this.shouldShowHappyChatButton(),
			'has-chat': this.props.chatIsOpen,
			'has-no-masterbar': this.props.masterbarIsHidden,
			'is-jetpack-login': this.props.isJetpackLogin,
			'is-jetpack-site': this.props.isJetpack,
			'is-jetpack-mobile-flow': this.props.isJetpackMobileFlow,
			'is-jetpack-woocommerce-flow': this.props.isJetpackWooCommerceFlow,
			'is-jetpack-woo-dna-flow': this.props.isJetpackWooDnaFlow,
			'is-wccom-oauth-flow': isWooOAuth2Client( this.props.oauth2Client ) && this.props.wccomFrom,
		} );

		const optionalBodyProps = () => {
			const bodyClass = [];
			if ( this.props.isNewLaunchFlow || this.props.isCheckoutFromGutenboarding ) {
				bodyClass.push( 'is-new-launch-flow' );
			}
			if ( this.props.isNavUnificationEnabled && ! config.isEnabled( 'jetpack-cloud' ) ) {
				// Jetpack cloud hasn't yet aligned with WPCOM.
				bodyClass.push( 'is-nav-unification' );
			}

			if ( this.props.sidebarIsCollapsed && isWithinBreakpoint( '>800px' ) ) {
				bodyClass.push( 'is-sidebar-collapsed' );
			}

			if ( this.props.useFontSmoothAntialiased ) {
				bodyClass.push( 'font-smoothing-antialiased' );
			}

			return {
				bodyClass,
			};
		};
		const { shouldShowAppBanner } = this.props;

		const loadInlineHelp = this.shouldLoadInlineHelp();

		const { shouldRequestReaderTeams } = this.props;

		return (
			<div className={ sectionClass }>
				{ shouldRequestReaderTeams && <QueryReaderTeams /> }
				<SidebarScrollSynchronizer enabled={ this.props.isNavUnificationEnabled } />
				<SidebarOverflowDelay layoutFocus={ this.props.currentLayoutFocus } />
				<BodySectionCssClass
					group={ this.props.sectionGroup }
					section={ this.props.sectionName }
					{ ...optionalBodyProps() }
				/>
				<HtmlIsIframeClassname />
				<DocumentHead />
				<QuerySites primaryAndRecent={ ! config.isEnabled( 'jetpack-cloud' ) } />
				{ this.props.shouldQueryAllSites && <QuerySites allSites /> }
				<QueryPreferences />
				{ config.isEnabled( 'layout/query-selected-editor' ) && (
					<QuerySiteSelectedEditor siteId={ this.props.siteId } />
				) }
				{ config.isEnabled( 'layout/guided-tours' ) && (
					<AsyncLoad require="calypso/layout/guided-tours" placeholder={ null } />
				) }
				{ config.isEnabled( 'layout/nps-survey-notice' ) && ! isE2ETest() && (
					<AsyncLoad require="calypso/layout/nps-survey-notice" placeholder={ null } />
				) }
				{ config.isEnabled( 'keyboard-shortcuts' ) ? <KeyboardShortcutsMenu /> : null }
				{ this.renderMasterbar() }
				{ config.isEnabled( 'support-user' ) && <SupportUser /> }
				<LayoutLoader />
				{ isJetpackCloud() && (
					<AsyncLoad require="calypso/jetpack-cloud/style" placeholder={ null } />
				) }
				{ this.props.isOffline && <OfflineStatus /> }
				<div id="content" className="layout__content">
					{ config.isEnabled( 'jitms' ) && this.props.isEligibleForJITM && (
						<AsyncLoad
							require="calypso/blocks/jitm"
							placeholder={ null }
							messagePath={ `calypso:${ this.props.sectionJitmPath }:admin_notices` }
						/>
					) }
					<AsyncLoad
						require="calypso/components/global-notices"
						placeholder={ null }
						id="notices"
					/>
					<div id="secondary" className="layout__secondary" role="navigation">
						{ this.props.secondary }
					</div>
					<div id="primary" className="layout__primary">
						{ this.props.primary }
					</div>
				</div>
				{ config.isEnabled( 'i18n/community-translator' )
					? this.props.isCommunityTranslatorEnabled && (
							<AsyncLoad require="calypso/components/community-translator" />
					  )
					: config( 'restricted_me_access' ) && (
							<AsyncLoad
								require="calypso/layout/community-translator/launcher"
								placeholder={ null }
							/>
					  ) }
				{ this.props.sectionGroup === 'sites' && <SitePreview /> }
				{ config.isEnabled( 'happychat' ) && this.props.chatIsOpen && (
					<AsyncLoad require="calypso/components/happychat" />
				) }
				{ 'development' === process.env.NODE_ENV && (
					<AsyncLoad require="calypso/components/webpack-build-monitor" placeholder={ null } />
				) }
				{ loadInlineHelp && (
					<AsyncLoad require="calypso/blocks/inline-help" placeholder={ null } />
				) }
				{ this.shouldShowHappyChatButton() && (
					<AsyncLoad
						require="calypso/components/happychat/button"
						placeholder={ null }
						allowMobileRedirect
						borderless={ false }
						// eslint-disable-next-line wpcalypso/jsx-classname-namespace
						className={ classnames( 'floating-happychat-button', {
							offset: loadInlineHelp,
						} ) }
					/>
				) }

				{ config.isEnabled( 'layout/support-article-dialog' ) && (
					<AsyncLoad require="calypso/blocks/support-article-dialog" placeholder={ null } />
				) }
				{ shouldShowAppBanner && config.isEnabled( 'layout/app-banner' ) && (
					<AsyncLoad require="calypso/blocks/app-banner" placeholder={ null } />
				) }
				{ config.isEnabled( 'gdpr-banner' ) && (
					<AsyncLoad require="calypso/blocks/gdpr-banner" placeholder={ null } />
				) }
				{ config.isEnabled( 'legal-updates-banner' ) && (
					<AsyncLoad require="calypso/blocks/legal-updates-banner" placeholder={ null } />
				) }
			</div>
		);
	}
}

export default compose(
	withCurrentRoute,
	connect( ( state, { currentSection, currentRoute, currentQuery } ) => {
		const sectionGroup = currentSection?.group ?? null;
		const sectionName = currentSection?.name ?? null;
		const siteId = getSelectedSiteId( state );
		const shouldShowAppBanner = getShouldShowAppBanner( getSelectedSite( state ) );
		const sectionJitmPath = getMessagePathForJITM( currentRoute );
		const isJetpackLogin = startsWith( currentRoute, '/log-in/jetpack' );
		const isJetpack = isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId );
		const isCheckoutFromGutenboarding =
			'checkout' === sectionName && '1' === currentQuery?.preLaunch;
		const noMasterbarForRoute = isJetpackLogin || currentRoute === '/me/account/closed';
		const noMasterbarForSection = [ 'signup', 'jetpack-connect' ].includes( sectionName );
		const isJetpackMobileFlow = 'jetpack-connect' === sectionName && !! retrieveMobileRedirect();
		const isJetpackWooCommerceFlow =
			[ 'jetpack-connect', 'login' ].includes( sectionName ) &&
			'woocommerce-onboarding' === currentQuery?.from;
		const isJetpackWooDnaFlow =
			[ 'jetpack-connect', 'login' ].includes( sectionName ) &&
			wooDnaConfig( currentQuery ).isWooDnaFlow();
		const oauth2Client = getCurrentOAuth2Client( state );
		const wccomFrom = currentQuery?.[ 'wccom-from' ];
		const isEligibleForJITM = [
			'home',
			'stats',
			'plans',
			'themes',
			'plugins',
			'comments',
		].includes( sectionName );
		const isNewLaunchFlow = startsWith( currentRoute, '/start/new-launch' );

		return {
			masterbarIsHidden:
				! masterbarIsVisible( state ) ||
				noMasterbarForSection ||
				noMasterbarForRoute ||
				isWpMobileApp(),
			isJetpack,
			isJetpackLogin,
			isJetpackWooCommerceFlow,
			isJetpackWooDnaFlow,
			isJetpackMobileFlow,
			isEligibleForJITM,
			isCommunityTranslatorEnabled: isCommunityTranslatorEnabled( state ),
			oauth2Client,
			wccomFrom,
			isSupportSession: isSupportSession( state ),
			sectionGroup,
			sectionName,
			sectionJitmPath,
			shouldShowAppBanner,
			isOffline: isOffline( state ),
			currentLayoutFocus: getCurrentLayoutFocus( state ),
			chatIsOpen: isHappychatOpen( state ),
			hasActiveHappyChat: hasActiveHappychatSession( state ),
			colorSchemePreference: getPreference( state, 'colorScheme' ),
			siteId,
			// We avoid requesting sites in the Jetpack Connect authorization step, because this would
			// request all sites before authorization has finished. That would cause the "all sites"
			// request to lack the newly authorized site, and when the request finishes after
			// authorization, it would remove the newly connected site that has been fetched separately.
			// See https://github.com/Automattic/wp-calypso/pull/31277 for more details.
			shouldQueryAllSites: currentRoute && currentRoute !== '/jetpack/connect/authorize',
			isNewLaunchFlow,
			isCheckoutFromGutenboarding,
			isNavUnificationEnabled: isNavUnificationEnabled( state ),
			sidebarIsCollapsed: getSidebarIsCollapsed( state ),
			shouldRequestReaderTeams: !! getCurrentUser( state ),
			useFontSmoothAntialiased: isAutomatticTeamMember( getReaderTeams( state ) ),
		};
	} )
)( Layout );
