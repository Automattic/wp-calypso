import config from '@automattic/calypso-config';
import { useLocalizeUrl, removeLocaleFromPathLocaleInFront } from '@automattic/i18n-utils';
import { UniversalNavbarHeader, UniversalNavbarFooter } from '@automattic/wpcom-template-parts';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import { CookieBannerContainerSSR } from 'calypso/blocks/cookie-banner';
import AsyncLoad from 'calypso/components/async-load';
import { withCurrentRoute } from 'calypso/components/route';
import SympathyDevWarning from 'calypso/components/sympathy-dev-warning';
import wooDnaConfig from 'calypso/jetpack-connect/woo-dna-config';
import MasterbarLoggedOut from 'calypso/layout/masterbar/logged-out';
import MasterbarLogin from 'calypso/layout/masterbar/login';
import OauthClientMasterbar from 'calypso/layout/masterbar/oauth-client';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isWpMobileApp } from 'calypso/lib/mobile-app';
import { navigate } from 'calypso/lib/navigate';
import {
	isCrowdsignalOAuth2Client,
	isWooOAuth2Client,
	isGravatarOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isPartnerSignupQuery } from 'calypso/state/login/utils';
import {
	getCurrentOAuth2Client,
	showOAuth2Layout,
} from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
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
	isGravatarLogin,
	wccomFrom,
	masterbarIsHidden,
	oauth2Client,
	primary,
	secondary,
	headerSection,
	sectionGroup,
	sectionName,
	sectionTitle,
	redirectUri,
	useOAuth2Layout,
	showGdprBanner,
	isPartnerSignup,
	isPartnerSignupStart,
	locale,
} ) => {
	const localizeUrl = useLocalizeUrl();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const currentRoute = useSelector( getCurrentRoute );
	const pathNameWithoutLocale =
		currentRoute && removeLocaleFromPathLocaleInFront( currentRoute ).slice( 1 );

	const isCheckout = sectionName === 'checkout';
	const isCheckoutPending = sectionName === 'checkout-pending';
	const isJetpackCheckout =
		sectionName === 'checkout' && window.location.pathname.startsWith( '/checkout/jetpack' );

	const isJetpackThankYou =
		sectionName === 'checkout' &&
		window.location.pathname.startsWith( '/checkout/jetpack/thank-you' );

	const isReaderTagPage =
		sectionName === 'reader' && window.location.pathname.startsWith( '/tag/' );

	const classes = {
		[ 'is-group-' + sectionGroup ]: sectionGroup,
		[ 'is-section-' + sectionName ]: sectionName,
		'focus-content': true,
		'has-header-section': headerSection,
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
		'is-gravatar': isGravatarLogin,
	};

	let masterbar = null;

	// Uses custom styles for DOPS clients and WooCommerce - which are the only ones with a name property defined
	if ( useOAuth2Layout && oauth2Client && oauth2Client.name ) {
		if ( isPartnerSignup && ! isPartnerSignupStart ) {
			// Using localizeUrl directly to sidestep issue with useLocale use in SSR
			masterbar = (
				<MasterbarLogin goBackUrl={ localizeUrl( 'https://wordpress.com/partners/', locale ) } />
			);
		} else if ( isWooOAuth2Client( oauth2Client ) && wccomFrom ) {
			masterbar = null;
		} else {
			if ( ! isGravatarLogin ) {
				classes.dops = true;
				// Using .is-gravatar instead of .gravatar to avoid style conflicts with the Gravatar component
				classes[ oauth2Client.name ] = true;
			}

			// Force masterbar for all Crowdsignal OAuth pages
			if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
				classes[ 'has-no-masterbar' ] = false;
			}

			masterbar = <OauthClientMasterbar oauth2Client={ oauth2Client } />;
		}
	} else if ( config.isEnabled( 'jetpack-cloud' ) || isWpMobileApp() || isJetpackThankYou ) {
		masterbar = null;
	} else if (
		[ 'plugins', 'themes', 'theme', 'reader', 'subscriptions' ].includes( sectionName ) &&
		! isReaderTagPage
	) {
		masterbar = (
			<UniversalNavbarHeader
				isLoggedIn={ isLoggedIn }
				sectionName={ sectionName }
				{ ...( sectionName === 'subscriptions' && { variant: 'minimal' } ) }
			/>
		);
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
				{ headerSection && <div className="layout__header-section-content">{ headerSection }</div> }
			</div>
			{ isJetpackCloud() && (
				<AsyncLoad require="calypso/jetpack-cloud/style" placeholder={ null } />
			) }
			<div id="content" className="layout__content">
				<AsyncLoad require="calypso/components/global-notices" placeholder={ null } id="notices" />
				{ isCheckout && <AsyncLoad require="calypso/blocks/inline-help" placeholder={ null } /> }
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

			{ sectionName === 'plugins' && (
				<>
					<UniversalNavbarFooter
						currentRoute={ currentRoute }
						isLoggedIn={ isLoggedIn }
						onLanguageChange={ ( e ) => {
							navigate( `/${ e.target.value }/${ pathNameWithoutLocale }` );
							window.location.reload();
						} }
					/>
					{ config.isEnabled( 'layout/support-article-dialog' ) && (
						<AsyncLoad require="calypso/blocks/support-article-dialog" placeholder={ null } />
					) }
				</>
			) }

			{ [ 'themes', 'theme' ].includes( sectionName ) && (
				<UniversalNavbarFooter
					onLanguageChange={ ( e ) => {
						navigate( `/${ e.target.value }/${ pathNameWithoutLocale }` );
						window.location.reload();
					} }
					currentRoute={ currentRoute }
					isLoggedIn={ isLoggedIn }
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
	connect( ( state, { currentSection, currentRoute, currentQuery } ) => {
		const sectionGroup = currentSection?.group ?? null;
		const sectionName = currentSection?.name ?? null;
		const sectionTitle = currentSection?.title ?? '';
		const isJetpackLogin = currentRoute.startsWith( '/log-in/jetpack' );
		const isPartnerSignup = isPartnerSignupQuery( currentQuery );
		const isPartnerSignupStart = currentRoute.startsWith( '/start/wpcc' );
		const isJetpackWooDnaFlow = wooDnaConfig( getInitialQueryArguments( state ) ).isWooDnaFlow();
		const isP2Login = 'login' === sectionName && 'p2' === currentQuery?.from;
		const oauth2Client = getCurrentOAuth2Client( state );
		const isGravatarLogin = isGravatarOAuth2Client( oauth2Client );
		const isReskinLoginRoute =
			currentRoute.startsWith( '/log-in' ) &&
			! isJetpackLogin &&
			! isP2Login &&
			Boolean( currentQuery?.client_id ) === false;
		const isWhiteLogin =
			isReskinLoginRoute || ( isPartnerSignup && ! isPartnerSignupStart ) || isGravatarLogin;
		const noMasterbarForRoute =
			isJetpackLogin || ( isWhiteLogin && ! isPartnerSignup ) || isJetpackWooDnaFlow || isP2Login;
		const isPopup = '1' === currentQuery?.is_popup;
		const noMasterbarForSection =
			! isWooOAuth2Client( oauth2Client ) &&
			[ 'signup', 'jetpack-connect' ].includes( sectionName );
		const isJetpackWooCommerceFlow = 'woocommerce-onboarding' === currentQuery?.from;
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
			isGravatarLogin,
			wccomFrom,
			masterbarIsHidden,
			sectionGroup,
			sectionName,
			sectionTitle,
			oauth2Client,
			useOAuth2Layout: showOAuth2Layout( state ),
			isPartnerSignup,
			isPartnerSignupStart,
		};
	} )( localize( LayoutLoggedOut ) )
);
