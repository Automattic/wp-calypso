import A4APlusWpComLogo from 'calypso/a8c-for-agencies/components/a4a-plus-wpcom-logo';
import blazeProLogo from 'calypso/assets/images/blaze/blaze-pro-logo.png';
import WooLogo from 'calypso/assets/images/icons/Woo_logo_color.svg';
import akismetLogo from 'calypso/assets/images/icons/akismet-logo.svg';
import crowdsignalLogo from 'calypso/assets/images/icons/crowdsignal.svg';
import gravatarLogo from 'calypso/assets/images/icons/gravatar.svg';
import studioAppLogo from 'calypso/assets/images/icons/studio-app-logo.svg';
import wpJobManagerLogo from 'calypso/assets/images/icons/wp-job-manager.png';
import JetpackLogo from 'calypso/components/jetpack-logo';
import JetpackPlusWpComLogo from 'calypso/components/jetpack-plus-wpcom-logo';
import SVGIcon from 'calypso/components/svg-icon';
import WPCloudLogo from 'calypso/components/wp-cloud-logo';
import {
	isCrowdsignalOAuth2Client,
	isGravPoweredOAuth2Client,
	isStudioAppOAuth2Client,
	isWPJobManagerOAuth2Client,
	isBlazeProOAuth2Client,
	isA4AOAuth2Client,
	isJetpackCloudOAuth2Client,
	isPartnerPortalOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { useSelector } from 'calypso/state';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getIsWoo from 'calypso/state/selectors/get-is-woo';

interface Props {
	isFromAkismet?: boolean;
	isJetpack?: boolean;
}

const HeadingLogo = ( { isFromAkismet, isJetpack }: Props ) => {
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isWoo = useSelector( getIsWoo );

	let logo = null;
	if ( isStudioAppOAuth2Client( oauth2Client ) ) {
		logo = <img src={ studioAppLogo } alt="Studio App Logo" />;
	} else if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
		logo = <img src={ crowdsignalLogo } alt="Crowdsignal Logo" />;
	} else if ( isFromAkismet ) {
		logo = <img src={ akismetLogo } alt="Akismet Logo" />;
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
