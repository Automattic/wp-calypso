import studioAppLogo from 'calypso/assets/images/icons/studio-app-logo.svg';
import { isStudioAppOAuth2Client } from 'calypso/lib/oauth2-clients';
import { useSelector } from 'calypso/state';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';

const HeadingLogo = () => {
	const oauth2Client = useSelector( getCurrentOAuth2Client );

	const logo = isStudioAppOAuth2Client( oauth2Client ) ? (
		<img className="wp-login__heading-logo-studio" src={ studioAppLogo } alt="Studio App Logo" />
	) : null;

	return logo ? <div className="wp-login__heading-logo">{ logo }</div> : null;
};

export default HeadingLogo;
