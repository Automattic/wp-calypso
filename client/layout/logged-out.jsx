import config, { isEnabled } from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import { UniversalNavbarHeader, UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { connect, useSelector } from 'react-redux';
import { CookieBannerContainerSSR } from 'calypso/blocks/cookie-banner';
import ReaderJoinConversationDialog from 'calypso/blocks/reader-join-conversation/dialog';
import AsyncLoad from 'calypso/components/async-load';
import { withCurrentRoute } from 'calypso/components/route';
import SympathyDevWarning from 'calypso/components/sympathy-dev-warning';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import MasterbarLoggedOut from 'calypso/layout/masterbar/logged-out';
import OauthClientMasterbar from 'calypso/layout/masterbar/oauth-client';
import { isInStepContainerV2FlowContext } from 'calypso/layout/utils';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isAkismetRedirect from 'calypso/lib/akismet/is-akismet-redirect';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import {
	isCrowdsignalOAuth2Client,
	isWooOAuth2Client,
	isGravatarOAuth2Client,
	isJetpackCloudOAuth2Client,
	isA4AOAuth2Client,
	isWPJobManagerOAuth2Client,
	isGravPoweredOAuth2Client,
	isBlazeProOAuth2Client,
	isPartnerPortalOAuth2Client,
	isStudioAppOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { createAccountUrl } from 'calypso/lib/paths';
import isReaderTagEmbedPage from 'calypso/lib/reader/is-reader-tag-embed-page';
import { getOnboardingUrl as getPatternLibraryOnboardingUrl } from 'calypso/my-sites/patterns/paths';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getRedirectToOriginal, isTwoFactorEnabled } from 'calypso/state/login/selectors';
import {
	getCurrentOAuth2Client,
	showOAuth2Layout,
} from 'calypso/state/oauth2-clients/ui/selectors';
import { clearLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import { getLastActionRequiresLogin } from 'calypso/state/reader-ui/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWoo from 'calypso/state/selectors/get-is-woo';
import getWccomFrom from 'calypso/state/selectors/get-wccom-from';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import { getIsOnboardingAffiliateFlow } from 'calypso/state/signup/flow/selectors';
import { masterbarIsVisible } from 'calypso/state/ui/selectors';
import BodySectionCssClass from './body-section-css-class';
import { refreshColorScheme, getColorSchemeFromCurrentQuery } from './color-scheme';
import HelpCenterLoader from './help-center-loader';

import './style.scss';

const LayoutLoggedOut = ( {
	isAkismet,
	isJetpackLogin,
	isWhiteLogin,
	isPopup,
	isJetpackWooDnaFlow,
	isGravatar,
	isWPJobManager,
	isGravPoweredClient,
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
	isWooJPC,
	isWoo,
	isBlazePro,
	locale,
	twoFactorEnabled,
	/* eslint-disable no-shadow */
	clearLastActionRequiresLogin,
	userAllowedToHelpCenter,
	colorScheme,
} ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const currentRoute = useSelector( getCurrentRoute );
	const loggedInAction = useSelector( getLastActionRequiresLogin );

	const isCheckout = sectionName === 'checkout';
	const isCheckoutPending = sectionName === 'checkout-pending';
	const isCheckoutFailed =
		sectionName === 'checkout' && currentRoute.startsWith( '/checkout/failed-purchases' );
	const isJetpackCheckout =
		sectionName === 'checkout' && currentRoute.startsWith( '/checkout/jetpack' );

	const isJetpackThankYou =
		sectionName === 'checkout' && currentRoute.startsWith( '/checkout/jetpack/thank-you' );

	const isReaderTagEmbed = typeof window !== 'undefined' && isReaderTagEmbedPage( window.location );

	// It's used to add a class name for the login-related pages, except for `/log-in/link/use`.
	const hasGravPoweredClientClass =
		isGravPoweredClient && ! currentRoute.startsWith( '/log-in/link/use' );

	const isMagicLogin = currentRoute && currentRoute.startsWith( '/log-in/link' );

	const isWpcomMagicLogin =
		isMagicLogin &&
		! isJetpackLogin &&
		! hasGravPoweredClientClass &&
		! isJetpackCloudOAuth2Client( oauth2Client ) &&
		! isA4AOAuth2Client( oauth2Client ) &&
		! isWooOAuth2Client( oauth2Client );

	const loadHelpCenter =
		isLoggedIn &&
		// we want to show only the Help center in my home and the help section (but not the FAB)
		( [ 'home', 'help' ].includes( sectionName ) ||
			currentRoute?.startsWith( '/start/do-it-for-me/' ) ) &&
		userAllowedToHelpCenter;

	const classes = {
		[ 'is-group-' + sectionGroup ]: sectionGroup,
		[ 'is-section-' + sectionName ]: sectionName,
		'focus-content': true,
		'has-header-section': renderHeaderSection,
		'has-no-sidebar': ! secondary,
		'has-no-masterbar': masterbarIsHidden,
		'is-akismet': isAkismet,
		'is-jetpack-login': isJetpackLogin,
		'is-jetpack-site': isJetpackCheckout,
		'is-white-login': isWhiteLogin,
		'is-popup': isPopup,
		'is-jetpack-woo-dna-flow': isJetpackWooDnaFlow,
		'is-gravatar': isGravatar,
		'is-wp-job-manager': isWPJobManager,
		'is-grav-powered-client': hasGravPoweredClientClass,
		'is-woocommerce-core-profiler-flow': isWooJPC,
		'is-magic-login': isMagicLogin,
		'is-wpcom-magic-login': isWpcomMagicLogin,
		'is-woo-passwordless': isWoo,
		'is-blaze-pro': isBlazePro,
		'two-factor-auth-enabled': twoFactorEnabled,
		'is-woo-com-oauth': isWooOAuth2Client( oauth2Client ),
		'feature-flag-woocommerce-core-profiler-passwordless-auth': true,
	};

	let masterbar = null;

	useEffect( () => {
		isWooJPC && refreshColorScheme( 'default', colorScheme );
	}, [] ); // Empty dependency array ensures it runs only once on mount

	// Open new window to create account page when a logged in action was triggered on the Reader tag embed page and the user is not logged in
	if ( ! isLoggedIn && loggedInAction && isReaderTagEmbed ) {
		const { pathname } = getUrlParts( window.location.href );
		window.open( createAccountUrl( { redirectTo: pathname, ref: 'reader-lp' } ), '_blank' );
	}

	if ( useOAuth2Layout && ( isGravatar || isGravPoweredClient ) ) {
		masterbar = null;
	} else if ( useOAuth2Layout && oauth2Client && oauth2Client.name && ! masterbarIsHidden ) {
		classes.dops = true;
		classes[ oauth2Client.name ] = true;

		masterbar = <OauthClientMasterbar oauth2Client={ oauth2Client } />;
	} else if (
		config.isEnabled( 'jetpack-cloud' ) ||
		isWpMobileApp() ||
		isJetpackThankYou ||
		isReaderTagEmbed
	) {
		masterbar = null;
	} else if (
		[
			'patterns',
			'performance-profiler',
			'plugins',
			'reader',
			'site-profiler',
			'subscriptions',
			'theme',
			'themes',
		].includes( sectionName )
	) {
		const nonMonochromeSections = [ 'plugins', 'themes', 'theme' ];

		const className = clsx( {
			'is-style-monochrome':
				isEnabled( 'site-profiler/metrics' ) && ! nonMonochromeSections.includes( sectionName ),
		} );

		masterbar = (
			<UniversalNavbarHeader
				isLoggedIn={ isLoggedIn }
				sectionName={ sectionName }
				className={ className }
				{ ...( isEnabled( 'site-profiler/metrics' ) &&
					! nonMonochromeSections.includes( sectionName ) && {
						logoColor: 'white',
					} ) }
				{ ...( sectionName === 'subscriptions' && { variant: 'minimal' } ) }
				{ ...( sectionName === 'patterns' && {
					startUrl: getPatternLibraryOnboardingUrl( locale, isLoggedIn ),
				} ) }
			/>
		);
	} else if ( isWooJPC ) {
		classes.woo = true;
		classes[ 'has-no-masterbar' ] = false;
		masterbar = (
			<AsyncLoad require="calypso/layout/masterbar/woo-core-profiler" placeholder={ null } />
		);
	} else {
		masterbar = ! masterbarIsHidden && (
			<MasterbarLoggedOut
				title={ sectionTitle }
				sectionName={ sectionName }
				isCheckout={ isCheckout }
				isCheckoutPending={ isCheckoutPending }
				isCheckoutFailed={ isCheckoutFailed }
				redirectUri={ redirectUri }
			/>
		);
	}

	const bodyClass = [ 'font-smoothing-antialiased' ];

	return (
		<div className={ clsx( 'layout', classes ) }>
			{ loadHelpCenter && (
				<HelpCenterLoader
					sectionName={ sectionName }
					loadHelpCenter={ loadHelpCenter }
					currentRoute={ currentRoute }
				/>
			) }
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
			{ isA8CForAgencies() && (
				<AsyncLoad require="calypso/a8c-for-agencies/style" placeholder={ null } />
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
					<UniversalNavbarFooter currentRoute={ currentRoute } isLoggedIn={ isLoggedIn } />

					{ config.isEnabled( 'layout/support-article-dialog' ) && (
						<AsyncLoad require="calypso/blocks/support-article-dialog" placeholder={ null } />
					) }
				</>
			) }

			{ [ 'patterns', 'reader', 'theme', 'themes' ].includes( sectionName ) &&
				! isReaderTagEmbed && (
					<UniversalNavbarFooter currentRoute={ currentRoute } isLoggedIn={ isLoggedIn } />
				) }

			{ ! isLoggedIn && ! isReaderTagEmbed && (
				<ReaderJoinConversationDialog
					onClose={ () => clearLastActionRequiresLogin() }
					isVisible={ !! loggedInAction }
					loggedInAction={ loggedInAction }
					onLoginSuccess={ () => {
						if ( loggedInAction?.redirectTo ) {
							window.location = loggedInAction.redirectTo;
						} else {
							window.location.reload();
						}
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
			const isAkismet = isAkismetRedirect(
				new URLSearchParams( getRedirectToOriginal( state )?.split( '?' )[ 1 ] ).get( 'back' )
			);
			const isJetpackLogin = currentRoute.startsWith( '/log-in/jetpack' );
			const isInvitationURL = currentRoute.startsWith( '/accept-invite' );
			const isJetpackWooDnaFlow = wooDnaConfig( getInitialQueryArguments( state ) ).isWooDnaFlow();
			const oauth2Client = getCurrentOAuth2Client( state );
			const isGravatar = isGravatarOAuth2Client( oauth2Client );
			const isWPJobManager = isWPJobManagerOAuth2Client( oauth2Client );
			const isBlazePro = getIsBlazePro( state );
			const isGravPoweredClient = isGravPoweredOAuth2Client( oauth2Client );
			const isPartnerPortal = isPartnerPortalOAuth2Client( oauth2Client );
			const isWooJPC = isWooJPCFlow( state );

			const isStudioClient = isStudioAppOAuth2Client( oauth2Client );
			const isCrowdsignalClient = isCrowdsignalOAuth2Client( oauth2Client );
			const isWhiteLogin =
				( currentRoute.startsWith( '/log-in' ) &&
					( ( ! isJetpackLogin &&
						Boolean( currentQuery?.client_id ) === false &&
						Boolean( currentQuery?.oauth2_client_id ) === false &&
						! isBlazePro &&
						! isWooJPC ) ||
						isStudioClient ||
						isCrowdsignalClient ) ) ||
				isPartnerPortal;

			const noMasterbarForRoute =
				isJetpackLogin ||
				( isWhiteLogin && ! isBlazePro ) ||
				isJetpackWooDnaFlow ||
				isInvitationURL;
			const isPopup = '1' === currentQuery?.is_popup;
			const noMasterbarForSection =
				! isWooOAuth2Client( oauth2Client ) &&
				! isBlazeProOAuth2Client( oauth2Client ) &&
				[ 'signup', 'jetpack-connect' ].includes( sectionName );
			const wccomFrom = getWccomFrom( state );
			const masterbarIsHidden =
				! ( currentSection || currentRoute ) ||
				! masterbarIsVisible( state ) ||
				noMasterbarForSection ||
				noMasterbarForRoute ||
				isInStepContainerV2FlowContext( currentRoute, currentQuery );
			const twoFactorEnabled = isTwoFactorEnabled( state );

			const colorScheme = isWooJPC ? getColorSchemeFromCurrentQuery( currentQuery ) : null;

			return {
				isAkismet,
				isJetpackLogin,
				isWhiteLogin,
				isPopup,
				isJetpackWooDnaFlow,
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
				isWooJPC,
				isWoo: getIsWoo( state ),
				isBlazePro: getIsBlazePro( state ),
				userAllowedToHelpCenter: ! getIsOnboardingAffiliateFlow( state ),
				twoFactorEnabled,
				colorScheme,
			};
		},
		{ clearLastActionRequiresLogin }
	)( localize( LayoutLoggedOut ) )
);
