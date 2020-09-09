/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { startsWith, get } from 'lodash';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import AsyncLoad from 'components/async-load';
import MasterbarLoggedIn from 'layout/masterbar/logged-in';
import JetpackCloudMasterbar from 'components/jetpack/masterbar';
import HtmlIsIframeClassname from 'layout/html-is-iframe-classname';
import notices from 'notices';
import config from 'config';
import OfflineStatus from 'layout/offline-status';
import QueryPreferences from 'components/data/query-preferences';
import QuerySites from 'components/data/query-sites';
import QuerySiteSelectedEditor from 'components/data/query-site-selected-editor';
import { isOffline } from 'state/application/selectors';
import {
	getSelectedSiteId,
	masterbarIsVisible,
	getSectionGroup,
	getSectionName,
	getSelectedSite,
} from 'state/ui/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';
import isHappychatOpen from 'state/happychat/selectors/is-happychat-open';
import { isJetpackSite } from 'state/sites/selectors';
import { isSupportSession } from 'state/support/selectors';
import SitePreview from 'blocks/site-preview';
import { getCurrentLayoutFocus } from 'state/ui/layout-focus/selectors';
import { getCurrentRoute } from 'state/selectors/get-current-route';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import DocumentHead from 'components/data/document-head';
import { getPreference } from 'state/preferences/selectors';
import KeyboardShortcutsMenu from 'lib/keyboard-shortcuts/menu';
import SupportUser from 'support/support-user';
import { isCommunityTranslatorEnabled } from 'components/community-translator/utils';
import { isE2ETest } from 'lib/e2e';
import { getMessagePathForJITM } from 'lib/route';
import BodySectionCssClass from './body-section-css-class';
import { retrieveMobileRedirect } from 'jetpack-connect/persistence-utils';
import { isWooOAuth2Client } from 'lib/oauth2-clients';
import { getCurrentOAuth2Client } from 'state/oauth2-clients/ui/selectors';
import LayoutLoader from './loader';
import wooDnaConfig from 'jetpack-connect/woo-dna-config';

/**
 * Style dependencies
 */
// goofy import for environment badge, which is SSR'd
import 'components/environment-badge/style.scss';
import './style.scss';
import { getShouldShowAppBanner } from './utils';

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

	shouldLoadInlineHelp() {
		if ( ! config.isEnabled( 'inline-help' ) ) {
			return false;
		}

		const exemptedSections = [ 'jetpack-connect', 'happychat', 'devdocs', 'help' ];
		const exemptedRoutes = [ '/jetpack/new', '/log-in/jetpack', '/me/account/closed' ];

		return (
			! exemptedSections.includes( this.props.sectionName ) &&
			! exemptedRoutes.includes( this.props.currentRoute )
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

	render() {
		const sectionClass = classnames(
			'layout',
			`is-group-${ this.props.sectionGroup }`,
			`is-section-${ this.props.sectionName }`,
			`focus-${ this.props.currentLayoutFocus }`,
			{
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
			}
		);

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
					<AsyncLoad require="layout/guided-tours" placeholder={ null } />
				) }
				{ config.isEnabled( 'layout/nps-survey-notice' ) && ! isE2ETest() && (
					<AsyncLoad require="layout/nps-survey-notice" placeholder={ null } />
				) }
				{ config.isEnabled( 'keyboard-shortcuts' ) ? <KeyboardShortcutsMenu /> : null }
				{ this.renderMasterbar() }
				{ config.isEnabled( 'support-user' ) && <SupportUser /> }
				<LayoutLoader />
				{ this.props.isOffline && <OfflineStatus /> }
				<div id="content" className="layout__content">
					{ config.isEnabled( 'jitms' ) && this.props.isEligibleForJITM && (
						<AsyncLoad
							require="blocks/jitm"
							placeholder={ null }
							messagePath={ `calypso:${ this.props.sectionJitmPath }:admin_notices` }
							sectionName={ this.props.sectionName }
						/>
					) }
					<AsyncLoad
						require="components/global-notices"
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
							<AsyncLoad require="components/community-translator" />
					  )
					: config( 'restricted_me_access' ) && (
							<AsyncLoad require="layout/community-translator/launcher" placeholder={ null } />
					  ) }
				{ this.props.sectionGroup === 'sites' && <SitePreview /> }
				{ config.isEnabled( 'happychat' ) && this.props.chatIsOpen && (
					<AsyncLoad require="components/happychat" />
				) }
				{ 'development' === process.env.NODE_ENV && (
					<AsyncLoad require="components/webpack-build-monitor" placeholder={ null } />
				) }
				{ this.shouldLoadInlineHelp() && (
					<AsyncLoad require="blocks/inline-help" placeholder={ null } />
				) }
				{ config.isEnabled( 'layout/support-article-dialog' ) && (
					<AsyncLoad require="blocks/support-article-dialog" placeholder={ null } />
				) }
				{ shouldShowAppBanner && config.isEnabled( 'layout/app-banner' ) && (
					<AsyncLoad require="blocks/app-banner" placeholder={ null } />
				) }
				{ config.isEnabled( 'gdpr-banner' ) && (
					<AsyncLoad require="blocks/gdpr-banner" placeholder={ null } />
				) }
				{ config.isEnabled( 'legal-updates-banner' ) && (
					<AsyncLoad require="blocks/legal-updates-banner" placeholder={ null } />
				) }
			</div>
		);
	}
}

export default connect( ( state ) => {
	const sectionGroup = getSectionGroup( state );
	const sectionName = getSectionName( state );
	const currentRoute = getCurrentRoute( state );
	const siteId = getSelectedSiteId( state );
	const shouldShowAppBanner = getShouldShowAppBanner( getSelectedSite( state ) );
	const sectionJitmPath = getMessagePathForJITM( currentRoute );
	const isJetpackLogin = startsWith( currentRoute, '/log-in/jetpack' );
	const isJetpack = isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId );
	const isCheckoutFromGutenboarding =
		'checkout' === sectionName && '1' === getCurrentQueryArguments( state )?.preLaunch;
	const noMasterbarForRoute =
		isJetpackLogin || isCheckoutFromGutenboarding || currentRoute === '/me/account/closed';
	const noMasterbarForSection = 'signup' === sectionName || 'jetpack-connect' === sectionName;
	const isJetpackMobileFlow = 'jetpack-connect' === sectionName && !! retrieveMobileRedirect();
	const isJetpackWooCommerceFlow =
		( 'jetpack-connect' === sectionName || 'login' === sectionName ) &&
		'woocommerce-onboarding' === get( getCurrentQueryArguments( state ), 'from' );
	const isJetpackWooDnaFlow =
		( 'jetpack-connect' === sectionName || 'login' === sectionName ) &&
		wooDnaConfig( getCurrentQueryArguments( state ) ).isWooDnaFlow();
	const oauth2Client = getCurrentOAuth2Client( state );
	const wccomFrom = get( getCurrentQueryArguments( state ), 'wccom-from' );
	const isEligibleForJITM =
		[ 'stats', 'plans', 'themes', 'plugins', 'comments' ].indexOf( sectionName ) >= 0;
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
		currentRoute,
		siteId,
		/* We avoid requesting sites in the Jetpack Connect authorization step, because this would
		request all sites before authorization has finished. That would cause the "all sites"
		request to lack the newly authorized site, and when the request finishes after
		authorization, it would remove the newly connected site that has been fetched separately.
		See https://github.com/Automattic/wp-calypso/pull/31277 for more details. */
		shouldQueryAllSites: currentRoute && currentRoute !== '/jetpack/connect/authorize',
		isNewLaunchFlow,
		isCheckoutFromGutenboarding,
	};
} )( Layout );
