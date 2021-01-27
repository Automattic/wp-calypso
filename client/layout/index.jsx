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
import HtmlIsIframeClassname from 'calypso/layout/html-is-iframe-classname';
import notices from 'calypso/notices';
import config from 'calypso/config';
import OfflineStatus from 'calypso/layout/offline-status';
import QueryPreferences from 'calypso/components/data/query-preferences';
import QuerySites from 'calypso/components/data/query-sites';
import QuerySiteSelectedEditor from 'calypso/components/data/query-site-selected-editor';
import { isOffline } from 'calypso/state/application/selectors';
import { getSelectedSiteId, masterbarIsVisible, getSelectedSite } from 'calypso/state/ui/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isHappychatOpen from 'calypso/state/happychat/selectors/is-happychat-open';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { isSupportSession } from 'calypso/state/support/selectors';
import SitePreview from 'calypso/blocks/site-preview';
import { getCurrentLayoutFocus } from 'calypso/state/ui/layout-focus/selectors';
import DocumentHead from 'calypso/components/data/document-head';
import { getPreference } from 'calypso/state/preferences/selectors';
import KeyboardShortcutsMenu from 'calypso/lib/keyboard-shortcuts/menu';
import SupportUser from 'calypso/support/support-user';
import { isCommunityTranslatorEnabled } from 'calypso/components/community-translator/utils';
import { isE2ETest } from 'calypso/lib/e2e';
import { getMessagePathForJITM } from 'calypso/lib/route';
import BodySectionCssClass from './body-section-css-class';
import { retrieveMobileRedirect } from 'calypso/jetpack-connect/persistence-utils';
import { isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import LayoutLoader from './loader';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import { withCurrentRoute } from 'calypso/components/route';
import QueryExperiments from 'calypso/components/data/query-experiments';
import Experiment from 'calypso/components/experiment';
import QueryReaderTeams from 'calypso/components/data/query-reader-teams';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';

/**
 * Style dependencies
 */
// goofy import for environment badge, which is SSR'd
import 'calypso/components/environment-badge/style.scss';
import './style.scss';
import { getShouldShowAppBanner, handleScroll } from './utils';

const scrollCallback = ( e ) => handleScroll( e );

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
	};

	UNSAFE_componentWillMount() {
		// This is temporary helper function until we have rolled out to 100% of customers.
		this.isNavUnificationEnabled();
	}

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

		// This code should be removed when the nav-unification project has been rolled out to 100% of the customers.
		if ( config.isEnabled( 'nav-unification' ) ) {
			window.addEventListener( 'scroll', scrollCallback );
			window.addEventListener( 'resize', scrollCallback );
		}
	}

	componentWillUnmount() {
		if ( config.isEnabled( 'nav-unification' ) ) {
			window.removeEventListener( 'scroll', scrollCallback );
			window.removeEventListener( 'resize', scrollCallback );
		}
	}

	componentDidUpdate( prevProps ) {
		if ( prevProps.teams !== this.props.teams ) {
			// This is temporary helper function until we have rolled out to 100% of customers.
			this.isNavUnificationEnabled();
		}
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

	shouldLoadInlineHelp() {
		if ( ! config.isEnabled( 'inline-help' ) ) {
			return false;
		}

		const exemptedSections = [ 'jetpack-connect', 'happychat', 'devdocs', 'help' ];
		const exemptedRoutes = [ '/log-in/jetpack', '/me/account/closed' ];
		const exemptedRoutesStartingWith = [ '/start/p2' ];

		return (
			! exemptedSections.includes( this.props.sectionName ) &&
			! exemptedRoutes.includes( this.props.currentRoute ) &&
			! some( exemptedRoutesStartingWith, ( startsWithString ) =>
				this.props.currentRoute?.startsWith( startsWithString )
			)
		);
	}

	renderMasterbar() {
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

	// This is temporary helper function until we have rolled out to 100% of customers.
	isNavUnificationEnabled() {
		if ( ! this.props.teams.length ) {
			return;
		}

		// Having the feature enabled by default in all environments, will let anyone use ?disable-nav-unification to temporary disable it.
		// We still have the feature disabled in production as safety mechanism for all customers.
		if ( new URL( document.location ).searchParams.has( 'disable-nav-unification' ) ) {
			return;
		}

		// Leave the feature enabled for all a12s.
		if ( isAutomatticTeamMember( this.props.teams ) ) {
			// Force enable even in Production.
			return config.enable( 'nav-unification' );
		}

		// Disable the feature for all customers and non a12s accounts.
		return config.disable( 'nav-unification' );
	}

	render() {
		const sectionClass = classnames( 'layout', `focus-${ this.props.currentLayoutFocus }`, {
			[ 'is-group-' + this.props.sectionGroup ]: this.props.sectionGroup,
			[ 'is-section-' + this.props.sectionName ]: this.props.sectionName,
			'is-support-session': this.props.isSupportSession,
			'has-no-sidebar': ! this.props.secondary,
			'has-chat': this.props.chatIsOpen,
			'has-no-masterbar': this.props.masterbarIsHidden,
			'is-jetpack-login': this.props.isJetpackLogin,
			'is-jetpack-site': this.props.isJetpack,
			'is-jetpack-mobile-flow': this.props.isJetpackMobileFlow,
			'is-jetpack-woocommerce-flow':
				config.isEnabled( 'jetpack/connect/woocommerce' ) && this.props.isJetpackWooCommerceFlow,
			'is-jetpack-woo-dna-flow': this.props.isJetpackWooDnaFlow,
			'is-wccom-oauth-flow':
				config.isEnabled( 'woocommerce/onboarding-oauth' ) &&
				isWooOAuth2Client( this.props.oauth2Client ) &&
				this.props.wccomFrom,
			'is-nav-unification': config.isEnabled( 'nav-unification' ),
		} );

		const optionalBodyProps = () => {
			const optionalProps = {};

			if ( this.props.isNewLaunchFlow || this.props.isCheckoutFromGutenboarding ) {
				optionalProps.bodyClass = 'is-new-launch-flow';
			}

			return optionalProps;
		};

		const { shouldShowAppBanner } = this.props;
		return (
			<div className={ sectionClass }>
				<QueryExperiments />
				<Experiment name="new_onboarding_existing_users_non_en_v5" />
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
						notices={ notices.list }
					/>
					<div id="secondary" className="layout__secondary" role="navigation">
						{ this.props.secondary }
					</div>
					<div id="primary" className="layout__primary">
						{ this.props.primary }
					</div>
				</div>
				{ config.isEnabled( 'i18n/community-translator' )
					? isCommunityTranslatorEnabled() && (
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
				{ this.shouldLoadInlineHelp() && (
					<AsyncLoad require="calypso/blocks/inline-help" placeholder={ null } />
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
				<QueryReaderTeams />
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
		const noMasterbarForRoute =
			isJetpackLogin || isCheckoutFromGutenboarding || currentRoute === '/me/account/closed';
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
				! masterbarIsVisible( state ) || noMasterbarForSection || noMasterbarForRoute,
			isJetpack,
			isJetpackLogin,
			isJetpackWooCommerceFlow,
			isJetpackWooDnaFlow,
			isJetpackMobileFlow,
			isEligibleForJITM,
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
			teams: getReaderTeams( state ),
		};
	} )
)( Layout );
