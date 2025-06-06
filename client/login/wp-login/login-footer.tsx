import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import SocialTos from 'calypso/blocks/authentication/social/social-tos';
import {
	isGravatarFlowOAuth2Client,
	isGravatarOAuth2Client,
	isGravPoweredOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentLocaleSlug from 'calypso/state/selectors/get-current-locale-slug';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';

interface LoginFooterProps {
	lostPasswordLink: JSX.Element;
	shouldRenderTos: boolean;
}

const LoginFooter = ( { lostPasswordLink, shouldRenderTos }: LoginFooterProps ) => {
	const translate = useTranslate();
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isGravPoweredClient = isGravPoweredOAuth2Client( oauth2Client );
	const currentQuery = useSelector( getCurrentQueryArguments );
	const locale = useSelector( getCurrentLocaleSlug );
	const isGravatar = isGravatarOAuth2Client( oauth2Client );
	const isGravatarFlow = isGravatarFlowOAuth2Client( oauth2Client );

	const magicLoginUrl = login( {
		locale,
		twoFactorAuthType: 'link',
		oauth2ClientId: currentQuery?.client_id as string,
		redirectTo: currentQuery?.redirect_to as string,
		gravatarFrom: currentQuery?.gravatar_from as string,
		gravatarFlow: isGravatarFlow,
		emailAddress: currentQuery?.email_address as string,
	} );

	if ( ! lostPasswordLink && ! shouldRenderTos ) {
		return null;
	}

	return (
		<div className="wp-login__main-footer">
			{ shouldRenderTos && <SocialTos /> }
			{ isGravPoweredClient && (
				<div className="wp-login__main-footer-magic-login">
					<a
						href={ magicLoginUrl }
						onClick={ () => recordTracksEvent( 'calypso_login_magic_login_request_click' ) }
					>
						{ isGravatar
							? translate( 'Email me a login code' )
							: translate( 'Email me a login link' ) }
					</a>
				</div>
			) }
			{ lostPasswordLink }
			{ isGravPoweredClient && (
				<div className="wp-login__main-footer-help-docs">
					{ translate( 'Any question? {{a}}Check our help docs{{/a}}.', {
						components: {
							a: <a href="https://gravatar.com/support" target="_blank" rel="noreferrer" />,
						},
					} ) }
				</div>
			) }
		</div>
	);
};

export default LoginFooter;
