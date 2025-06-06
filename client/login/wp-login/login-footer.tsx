import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import SocialTos from 'calypso/blocks/authentication/social/social-tos';
import { isGravPoweredOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';

interface LoginFooterProps {
	lostPasswordLink: JSX.Element;
	shouldRenderTos: boolean;
}

const LoginFooter = ( { lostPasswordLink, shouldRenderTos }: LoginFooterProps ) => {
	const translate = useTranslate();
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isGravPoweredClient = isGravPoweredOAuth2Client( oauth2Client );

	if ( ! lostPasswordLink && ! shouldRenderTos ) {
		return null;
	}

	return (
		<div className="wp-login__main-footer">
			{ shouldRenderTos && <SocialTos /> }
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
