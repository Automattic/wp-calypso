import akismetLogo from 'calypso/assets/images/icons/akismet-logo.svg';
import crowdsignalLogo from 'calypso/assets/images/icons/crowdsignal.svg';
import studioAppLogo from 'calypso/assets/images/icons/studio-app-logo.svg';
import { isCrowdsignalOAuth2Client, isStudioAppOAuth2Client } from 'calypso/lib/oauth2-clients';
import { useSelector } from 'calypso/state';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';

interface Props {
	isFromAkismet?: boolean;
}

const HeadingLogo = ( { isFromAkismet }: Props ) => {
	const oauth2Client = useSelector( getCurrentOAuth2Client );

	let logo = null;
	if ( isStudioAppOAuth2Client( oauth2Client ) ) {
		logo = <img src={ studioAppLogo } alt="Studio App Logo" />;
	} else if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
		logo = <img src={ crowdsignalLogo } alt="Crowdsignal Logo" />;
	} else if ( isFromAkismet ) {
		logo = <img src={ akismetLogo } alt="Akismet Logo" />;
	}

	return logo ? <div className="wp-login__heading-logo">{ logo }</div> : null;
};

export default HeadingLogo;
