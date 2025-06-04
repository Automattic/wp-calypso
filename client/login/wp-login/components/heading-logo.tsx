import blazeProLogo from 'calypso/assets/images/blaze/blaze-pro-logo.png';
import akismetLogo from 'calypso/assets/images/icons/akismet-logo.svg';
import crowdsignalLogo from 'calypso/assets/images/icons/crowdsignal.svg';
import gravatarLogo from 'calypso/assets/images/icons/gravatar.svg';
import studioAppLogo from 'calypso/assets/images/icons/studio-app-logo.svg';
import wpJobManagerLogo from 'calypso/assets/images/icons/wp-job-manager.png';
import {
	isCrowdsignalOAuth2Client,
	isGravPoweredOAuth2Client,
	isStudioAppOAuth2Client,
	isWPJobManagerOAuth2Client,
	isBlazeProOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { useSelector } from 'calypso/state';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import type { OAuth2Client } from 'calypso/login/types';

interface Props {
	isFromAkismet?: boolean;
	width?: number;
	height?: number;
}

const HeadingLogo = ( { isFromAkismet, width, height }: Props ) => {
	const oauth2Client = useSelector( getCurrentOAuth2Client ) as OAuth2Client | null;

	let clientLogo: string | null = null;
	if ( isStudioAppOAuth2Client( oauth2Client ) ) {
		clientLogo = studioAppLogo;
	} else if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
		clientLogo = crowdsignalLogo;
	} else if ( isFromAkismet ) {
		clientLogo = akismetLogo;
	} else if ( isWPJobManagerOAuth2Client( oauth2Client ) ) {
		clientLogo = wpJobManagerLogo;
	} else if ( isBlazeProOAuth2Client( oauth2Client ) ) {
		clientLogo = blazeProLogo;
	} else if ( isGravPoweredOAuth2Client( oauth2Client ) ) {
		/**
		 * Leave last to avoid overriding other grav-powered client logos.
		 */
		clientLogo = gravatarLogo;
	}

	return clientLogo ? (
		<img
			src={ clientLogo }
			alt={ `${ oauth2Client?.name ?? 'Login' } Client Logo` }
			width={ width }
			height={ height }
		/>
	) : null;
};

export default HeadingLogo;
