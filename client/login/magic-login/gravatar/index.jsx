import clsx from 'clsx';
import Main from 'calypso/components/main';
import {
	isGravatarFlowOAuth2Client,
	isGravatarOAuth2Client,
	isWPJobManagerOAuth2Client,
} from 'calypso/lib/oauth2-clients';

const GRAVATAR_FROM_3RD_PARTY = '3rd-party';
const GRAVATAR_FROM_QUICK_EDITOR = 'quick-editor';

const GravPoweredMagicLogin = ( {
	renderGravPoweredMagicLogin,
	oauth2Client,
	query,
	showSecondaryEmailOptions,
	showEmailCodeVerification,
	showEmailLinkVerification,
	renderGravPoweredSecondaryEmailOptions,
	renderGravPoweredEmailCodeVerification,
	renderGravPoweredEmailLinkVerification,
} ) => {
	let renderContent = renderGravPoweredMagicLogin();
	const hasSubHeader =
		isGravatarFlowOAuth2Client( oauth2Client ) ||
		( isGravatarOAuth2Client( oauth2Client ) &&
			( query?.gravatar_from === GRAVATAR_FROM_3RD_PARTY ||
				query?.gravatar_from === GRAVATAR_FROM_QUICK_EDITOR ) );

	if ( showSecondaryEmailOptions ) {
		renderContent = renderGravPoweredSecondaryEmailOptions();
	} else if ( showEmailCodeVerification ) {
		renderContent = renderGravPoweredEmailCodeVerification();
	} else if ( showEmailLinkVerification ) {
		renderContent = renderGravPoweredEmailLinkVerification();
	}

	return (
		<Main
			className={ clsx( 'grav-powered-magic-login', {
				'grav-powered-magic-login--has-sub-header': hasSubHeader,
				'grav-powered-magic-login--wp-job-manager': isWPJobManagerOAuth2Client( oauth2Client ),
			} ) }
		>
			{ renderContent }
		</Main>
	);
};

export default GravPoweredMagicLogin;
