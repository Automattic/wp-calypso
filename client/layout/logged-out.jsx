import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { useLocalizeUrl, removeLocaleFromPathLocaleInFront } from '@automattic/i18n-utils';
import { UniversalNavbarHeader, UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import { CookieBannerContainerSSR } from 'calypso/blocks/cookie-banner';
import ReaderJoinConversationDialog from 'calypso/blocks/reader-join-conversation/dialog';
import AsyncLoad from 'calypso/components/async-load';
import { withCurrentRoute } from 'calypso/components/route';
import SympathyDevWarning from 'calypso/components/sympathy-dev-warning';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import MasterbarLoggedOut from 'calypso/layout/masterbar/logged-out';
import MasterbarLogin from 'calypso/layout/masterbar/login';
import OauthClientMasterbar from 'calypso/layout/masterbar/oauth-client';
import WooCoreProfilerMasterbar from 'calypso/layout/masterbar/woo-core-profiler';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { navigate } from 'calypso/lib/navigate';
import {
	isCrowdsignalOAuth2Client,
	isWooOAuth2Client,
	isGravatarOAuth2Client,
	isWPJobManagerOAuth2Client,
	isGravPoweredOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { createAccountUrl } from 'calypso/lib/paths';
import isReaderTagEmbedPage from 'calypso/lib/reader/is-reader-tag-embed-page';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';
import { isPartnerSignupQuery } from 'calypso/state/login/utils';
import {
	getCurrentOAuth2Client,
	showOAuth2Layout,
} from 'calypso/state/oauth2-clients/ui/selectors';
import { clearLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import { getLastActionRequiresLogin } from 'calypso/state/reader-ui/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';
import { masterbarIsVisible } from 'calypso/state/ui/selectors';
import BodySectionCssClass from './body-section-css-class';
import './style.scss';

const LayoutLoggedOut = ( {
	isJetpackLogin,
	isWhiteLogin,
	isPopup,
	isJetpackWooCommerceFlow,
	isJetpackWooDnaFlow,
	isP2Login,
	isGravatar,
	isWPJobManager,
	isGravPoweredClient,
	wccomFrom,
	masterbarIsHidden,
	oauth2Client,
	primary,
	secondary,
	renderHeaderSection,
	sectionGroup,
	sectionName,
	sectionTitle,
	redirectUri,
	useOAuth2Layout,
	showGdprBanner,
	isPartnerSignup,
	isPartnerSignupStart,
	isWooCoreProfilerFlow,
	locale,
	/* eslint-disable no-shadow */
	clearLastActionRequiresLogin,
} ) => {
	const localizeUrl = useLocalizeUrl();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const currentRoute = useSelector( getCurrentRoute );
	const loggedInAction = useSelector( getLastActionRequiresLogin );
	const pathNameWithoutLocale = currentRoute && removeLocaleFromPathLocaleInFront( currentRoute );

	const isCheckout = sectionName === 'checkout';
	const isCheckoutPending = sectionName === 'checkout-pending';
	const isJetpackCheckout =
		sectionName === 'checkout' && currentRoute.startsWith( '/checkout/jetpack' );

	const isJetpackThankYou =
		sectionName === 'checkout' && currentRoute.startsWith( '/checkout/jetpack/thank-you' );

	const isReaderTagPage = sectionName === 'reader' && pathNameWithoutLocale.startsWith( '/tag/' );
	const isReaderTagEmbed = typeof window !== 'undefined' && isReaderTagEmbedPage( window.location );

	const isReaderDiscoverPage =
		sectionName === 'reader' && pathNameWithoutLocale.startsWith( '/discover' );

	const isReaderSearchPage =
		sectionName === 'reader' && pathNameWithoutLocale.startsWith( '/read/search' );

	// It's used to add a class name for the login and magic login of Gravatar powered clients only (not for F2A pages)
	const isGravPoweredLoginPage =
		isGravPoweredClient &&
		! currentRoute.startsWith( '/log-in/push' ) &&
		! currentRoute.startsWith( '/log-in/authenticator' ) &&
		! currentRoute.startsWith( '/log-in/sms' ) &&
		! currentRoute.startsWith( '/log-in/webauthn' ) &&
		! currentRoute.startsWith( '/log-in/backup' );

	const classes = {
		[ 'is-group-' + sectionGroup ]: sectionGroup,
		[ 'is-section-' + sectionName ]: sectionName,
		'focus-content': true,
		'has-header-section': renderHeaderSection,
		'has-no-sidebar': ! secondary,
		'has-no-masterbar': masterbarIsHidden,
		'is-jetpack-login': isJetpackLogin,
		'is-jetpack-site': isJetpackCheckout,
		'is-white-login': isWhiteLogin,
		'is-popup': isPopup,
		'is-jetpack-woocommerce-flow': isJetpackWooCommerceFlow,
		'is-jetpack-woo-dna-flow': isJetpackWooDnaFlow,
		'is-wccom-oauth-flow': isWooOAuth2Client( oauth2Client ) && wccomFrom,
		'is-p2-login': isP2Login,
		'is-gravatar': isGravatar,
		'is-wp-job-manager': isWPJobManager,
		'is-grav-powered-client': isGravPoweredClient,
		'is-grav-powered-login-page': isGravPoweredLoginPage,
		'is-woocommerce-core-profiler-flow': isWooCoreProfilerFlow,
	};

	let masterbar = null;

	// Open new window to create account page when a logged in action was triggered on the Reader tag embed page and the user is not logged in
	if ( ! isLoggedIn && loggedInAction ) {
		if ( isReaderTagEmbed ) {
			const { pathname } = getUrlParts( window.location.href );
			window.open( createAccountUrl( { redirectTo: pathname, ref: 'reader-lp' } ), '_blank' );
		}
	}

	// Uses custom styles for DOPS clients and WooCommerce - which are the only ones with a name property defined
	if ( useOAuth2Layout && oauth2Client && oauth2Client.name ) {
		if ( isPartnerSignup && ! isPartnerSignupStart ) {
			// Using localizeUrl directly to sidestep issue with useLocale use in SSR
			masterbar = (
				<MasterbarLogin goBackUrl={ localizeUrl( 'https://wordpress.com/partners/', locale ) } />
			);
		} else if (
			( isWooOAuth2Client( oauth2Client ) && wccomFrom ) ||
			isGravatar ||
			isGravPoweredClient
		) {
			masterbar = null;
		} else {
			classes.dops = true;
			classes[ oauth2Client.name ] = true;

			// Force masterbar for all Crowdsignal OAuth pages
			if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
				classes[ 'has-no-masterbar' ] = false;
			}

			masterbar = <OauthClientMasterbar oauth2Client={ oauth2Client } />;
		}
	} else if (
		config.isEnabled( 'jetpack-cloud' ) ||
		isWpMobileApp() ||
		isJetpackThankYou ||
		isReaderTagEmbed
	) {
		masterbar = null;
	} else if (
		[ 'plugins', 'themes', 'theme', 'reader', 'subscriptions', 'site-profiler' ].includes(
			sectionName
		) &&
		! isReaderTagPage &&
		! isReaderSearchPage &&
		! isReaderDiscoverPage
	) {
		masterbar = (
			<UniversalNavbarHeader
				isLoggedIn={ isLoggedIn }
				sectionName={ sectionName }
				{ ...( sectionName === 'subscriptions' && { variant: 'minimal' } ) }
			/>
		);
	} else if ( isWooCoreProfilerFlow ) {
		classes.woo = true;
		classes[ 'has-no-masterbar' ] = false;
		masterbar = <WooCoreProfilerMasterbar />;
	} else {
		masterbar = (
			<MasterbarLoggedOut
				title={ sectionTitle }
				sectionName={ sectionName }
				isCheckout={ isCheckout }
				isCheckoutPending={ isCheckoutPending }
				redirectUri={ redirectUri }
			/>
		);
	}

	const bodyClass = [ 'font-smoothing-antialiased' ];

	return (
		<div className={ classNames( 'layout', classes ) }>
			{ 'development' === process.env.NODE_ENV && <SympathyDevWarning /> }
			<BodySectionCssClass group={ sectionGroup } section={ sectionName } bodyClass={ bodyClass } />
			<div className="layout__header-section">
				{ masterbar }
				{ renderHeaderSection && (
					<div className="layout__header-section-content">{ renderHeaderSection() }</div>
				) }
			</div>
			{ isJetpackCloud() && (
				<AsyncLoad require="calypso/jetpack-cloud/style" placeholder={ null } />
			) }
			<div id="content" className="layout__content">
				<AsyncLoad require="calypso/components/global-notices" placeholder={ null } id="notices" />
				<div id="primary" className="layout__primary">
					{ primary }
				</div>
				<div id="secondary" className="layout__secondary">
					{ secondary }
				</div>
			</div>
			{ config.isEnabled( 'cookie-banner' ) && (
				<CookieBannerContainerSSR serverShow={ showGdprBanner } />
			) }

			{ [ 'plugins' ].includes( sectionName ) && (
				<>
					<UniversalNavbarFooter
						currentRoute={ currentRoute }
						isLoggedIn={ isLoggedIn }
						onLanguageChange={ ( e ) => {
							navigate( `/${ e.target.value + pathNameWithoutLocale }` );
							window.location.reload();
						} }
					/>
					{ config.isEnabled( 'layout/support-article-dialog' ) && (
						<AsyncLoad require="calypso/blocks/support-article-dialog" placeholder={ null } />
					) }
				</>
			) }

			{ [ 'themes', 'theme', 'reader' ].includes( sectionName ) && ! isReaderTagEmbed && (
				<UniversalNavbarFooter
					onLanguageChange={ ( e ) => {
						navigate( `/${ e.target.value + pathNameWithoutLocale }` );
						window.location.reload();
					} }
					currentRoute={ currentRoute }
					isLoggedIn={ isLoggedIn }
				/>
			) }

			{ ! isLoggedIn && ! isReaderTagEmbed && (
				<ReaderJoinConversationDialog
					onClose={ () => clearLastActionRequiresLogin() }
					isVisible={ !! loggedInAction }
					loggedInAction={ loggedInAction }
					onLoginSuccess={ () => {
						window.location.reload();
					} }
				/>
			) }
		</div>
	);
};

LayoutLoggedOut.displayName = 'LayoutLoggedOut';
LayoutLoggedOut.propTypes = {
	primary: PropTypes.element,
	secondary: PropTypes.element,
	// Connected props
	currentRoute: PropTypes.string,
	masterbarIsHidden: PropTypes.bool,
	section: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	redirectUri: PropTypes.string,
	showOAuth2Layout: PropTypes.bool,
};

export default withCurrentRoute(
	connect(
		( state, { currentSection, currentRoute, currentQuery } ) => {
			const sectionGroup = currentSection?.group ?? null;
			const sectionName = currentSection?.name ?? null;
			const sectionTitle = currentSection?.title ?? '';
			const isJetpackLogin = currentRoute.startsWith( '/log-in/jetpack' );
			const isPartnerSignup = isPartnerSignupQuery( currentQuery );
			const isPartnerSignupStart = currentRoute.startsWith( '/start/wpcc' );
			const isJetpackWooDnaFlow = wooDnaConfig( getInitialQueryArguments( state ) ).isWooDnaFlow();
			const isP2Login = 'login' === sectionName && 'p2' === currentQuery?.from;
			const oauth2Client = getCurrentOAuth2Client( state );
			const isGravatar = isGravatarOAuth2Client( oauth2Client );
			const isWPJobManager = isWPJobManagerOAuth2Client( oauth2Client );
			const redirectToOriginal = getRedirectToOriginal( state ) || '';
			const clientId = new URLSearchParams( redirectToOriginal.split( '?' )[ 1 ] ).get(
				'client_id'
			);
			const isGravPoweredClient =
				isGravPoweredOAuth2Client( oauth2Client ) ||
				// To cover the case of a login URL without the "client_id" parameter, e.g. /log-in/link/use
				isGravPoweredOAuth2Client( { id: Number( clientId ) } );
			const isReskinLoginRoute =
				currentRoute.startsWith( '/log-in' ) &&
				! isJetpackLogin &&
				! isP2Login &&
				Boolean( currentQuery?.client_id ) === false;
			const isWhiteLogin =
				isReskinLoginRoute ||
				( isPartnerSignup && ! isPartnerSignupStart ) ||
				isGravatar ||
				isGravPoweredClient;
			const noMasterbarForRoute =
				isJetpackLogin || ( isWhiteLogin && ! isPartnerSignup ) || isJetpackWooDnaFlow || isP2Login;
			const isPopup = '1' === currentQuery?.is_popup;
			const noMasterbarForSection =
				! isWooOAuth2Client( oauth2Client ) &&
				[ 'signup', 'jetpack-connect' ].includes( sectionName );
			const isJetpackWooCommerceFlow = 'woocommerce-onboarding' === currentQuery?.from;
			const isWooCoreProfilerFlow = isWooCommerceCoreProfilerFlow( state );
			const wccomFrom = currentQuery?.[ 'wccom-from' ];
			const masterbarIsHidden =
				! masterbarIsVisible( state ) || noMasterbarForSection || noMasterbarForRoute;
			return {
				isJetpackLogin,
				isWhiteLogin,
				isPopup,
				isJetpackWooCommerceFlow,
				isJetpackWooDnaFlow,
				isP2Login,
				isGravatar,
				isWPJobManager,
				isGravPoweredClient,
				wccomFrom,
				masterbarIsHidden,
				sectionGroup,
				sectionName,
				sectionTitle,
				oauth2Client,
				useOAuth2Layout: showOAuth2Layout( state ),
				isPartnerSignup,
				isPartnerSignupStart,
				isWooCoreProfilerFlow,
			};
		},
		{ clearLastActionRequiresLogin }
	)( localize( LayoutLoggedOut ) )
);
