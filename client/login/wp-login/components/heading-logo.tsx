import A4APlusWpComLogo from 'calypso/a8c-for-agencies/components/a4a-plus-wpcom-logo';
import blazeProLogo from 'calypso/assets/images/blaze/blaze-pro-logo.webp';
import WooLogo from 'calypso/assets/images/icons/Woo_logo_color.svg';
import akismetLogo from 'calypso/assets/images/icons/akismet-logo.svg';
import crowdsignalLogo from 'calypso/assets/images/icons/crowdsignal.svg';
import gravatarLogo from 'calypso/assets/images/icons/gravatar.svg';
import passportLogo from 'calypso/assets/images/icons/passport-icon-rounded.svg';
import studioAppLogo from 'calypso/assets/images/icons/studio-app-logo.svg';
import wpJobManagerLogo from 'calypso/assets/images/icons/wp-job-manager.webp';
import JetpackLogo from 'calypso/components/jetpack-logo';
import JetpackPlusWpComLogo from 'calypso/components/jetpack-plus-wpcom-logo';
import SVGIcon from 'calypso/components/svg-icon';
import WPCloudLogo from 'calypso/components/wp-cloud-logo';
import { getConnectorLogoUrl } from 'calypso/jetpack-connect/connector-branding-config';
import {
	isCrowdsignalOAuth2Client,
	isGravPoweredOAuth2Client,
	isStudioAppOAuth2Client,
	isWPJobManagerOAuth2Client,
	isBlazeProOAuth2Client,
	isA4AOAuth2Client,
	isJetpackCloudOAuth2Client,
	isPartnerPortalOAuth2Client,
	isSharedMobileAppOAuth2Client,
	isIosOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { usePartnerBranding } from 'calypso/lib/partner-branding';
import { useSelector } from 'calypso/state';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getIsAkismet from 'calypso/state/selectors/get-is-akismet';
import getIsJetpackApp from 'calypso/state/selectors/get-is-jetpack-app';
import getIsPassport from 'calypso/state/selectors/get-is-passport';
import getIsWoo from 'calypso/state/selectors/get-is-woo';

// The WordPress and Jetpack mobile apps are branded with their store icons, hosted
// on WordPress.com. `?w=128` requests the 2x asset for the 64px logo slot.
const MOBILE_APP_LOGO_URLS = {
	jetpackIos:
		'https://i0.wp.com/developer.files.wordpress.com/2026/07/jetpack-composited.png?w=128',
	jetpackAndroid: 'https://i0.wp.com/developer.files.wordpress.com/2026/07/app_icon.png?w=128',
	wordpressIos:
		'https://i0.wp.com/developer.files.wordpress.com/2026/07/wordpress-composited.png?w=128',
	wordpressAndroid:
		'https://i0.wp.com/developer.files.wordpress.com/2026/07/wordpress_app_icon.png?w=128',
};

interface Props {
	isJetpack?: boolean;
	isFromJetpackConnector?: boolean;
	connectorPlugins?: string[];
}

const HeadingLogo = ( { isJetpack, isFromJetpackConnector, connectorPlugins }: Props ) => {
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isWoo = useSelector( getIsWoo );
	const isAkismet = useSelector( getIsAkismet );
	const isPassport = useSelector( getIsPassport );
	const isJetpackApp = useSelector( getIsJetpackApp );
	const { hasCustomBranding } = usePartnerBranding();

	// If partner has custom top-left branding, don't show center logo
	if ( hasCustomBranding ) {
		return null;
	}

	let logo = null;
	if ( isStudioAppOAuth2Client( oauth2Client ) ) {
		logo = <img src={ studioAppLogo } alt="Studio App Logo" />;
	} else if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
		logo = <img src={ crowdsignalLogo } alt="Crowdsignal Logo" />;
	} else if ( isAkismet ) {
		logo = <img src={ akismetLogo } alt="Akismet Logo" />;
	} else if ( isPassport ) {
		logo = <img src={ passportLogo } alt="Passport Logo" />;
	} else if ( isWPJobManagerOAuth2Client( oauth2Client ) ) {
		logo = <img src={ wpJobManagerLogo } alt="WP Job Manager Logo" />;
	} else if ( isBlazeProOAuth2Client( oauth2Client ) ) {
		logo = <img src={ blazeProLogo } alt="Blaze Pro Logo" />;
	} else if ( isA4AOAuth2Client( oauth2Client ) ) {
		logo = <A4APlusWpComLogo size={ 32 } />;
	} else if ( isWoo ) {
		logo = (
			<SVGIcon
				name="woocommerce-logo"
				icon={ WooLogo }
				classes="masterbar__woo-client-logo"
				width="128"
				height="40"
				viewBox="0 0 60 24"
			/>
		);
	} else if ( isFromJetpackConnector ) {
		const connectorLogo = getConnectorLogoUrl( connectorPlugins );
		logo = (
			<img
				src={ connectorLogo }
				alt="Jetpack Connection logo"
				className="wp-login__connector-logo"
			/>
		);
	} else if ( isJetpackApp ) {
		logo = (
			<img
				src={
					isIosOAuth2Client( oauth2Client )
						? MOBILE_APP_LOGO_URLS.jetpackIos
						: MOBILE_APP_LOGO_URLS.jetpackAndroid
				}
				alt="Jetpack"
			/>
		);
	} else if ( isSharedMobileAppOAuth2Client( oauth2Client ) ) {
		// WordPress mobile app — the Jetpack app already matched `isJetpackApp` above.
		logo = (
			<img
				src={
					isIosOAuth2Client( oauth2Client )
						? MOBILE_APP_LOGO_URLS.wordpressIos
						: MOBILE_APP_LOGO_URLS.wordpressAndroid
				}
				alt="WordPress"
			/>
		);
	} else if ( isJetpack ) {
		logo = <JetpackLogo size={ 64 } />;
	} else if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
		logo = <JetpackPlusWpComLogo size={ 32 } />;
	} else if (
		isPartnerPortalOAuth2Client( oauth2Client ) &&
		document.location.search?.includes( 'wpcloud' )
	) {
		logo = <WPCloudLogo size={ 120 } />;
	} else if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
		/**
		 * Leave last to avoid overriding other grav-powered client logos.
		 */
		logo = <img src={ gravatarLogo } alt="Gravatar Logo" />;
	}

	return logo ? <div className="wp-login__one-login-layout-heading-logo">{ logo }</div> : null;
};

export default HeadingLogo;
