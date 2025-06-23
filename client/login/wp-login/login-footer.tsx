import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import SocialTos from 'calypso/blocks/authentication/social/social-tos';
import LoggedOutFormBackLink from 'calypso/components/logged-out-form/back-link';
import { isVIPOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import { useSignupUrl } from './hooks/use-signup-url';

interface LoginFooterProps {
	lostPasswordLink: JSX.Element;
	shouldRenderTos: boolean;
	action?: string;
	signupUrl?: string;
	isLoginView?: boolean;
}

const recordBackToWpcomLinkClick = () => {
	recordTracksEvent( 'calypso_login_back_to_wpcom_link_click' );
};

const LoginFooter = ( {
	lostPasswordLink,
	shouldRenderTos,
	action,
	signupUrl: signupUrlProp,
	isLoginView,
}: LoginFooterProps ) => {
	const translate = useTranslate();
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isVIPClient = isVIPOAuth2Client( oauth2Client );
	const signupUrl = useSignupUrl( { signupUrl: signupUrlProp } );
	const shouldRenderSignupLink = 'lostpassword' === action && false;

	if ( ! lostPasswordLink && ! shouldRenderTos ) {
		return null;
	}

	if ( shouldRenderSignupLink ) {
		return (
			<div className="wp-login__main-footer">
				<div className="wp-login__main-footer-back-link">
					{ translate( "Don't have an account? {{signupLink}}Sign up{{/signupLink}}", {
						components: {
							signupLink: <a href={ signupUrl } />,
						},
					} ) }
				</div>
			</div>
		);
	}

	if ( isLoginView ) {
		return (
			<div className="wp-login__main-footer">
				{ shouldRenderTos && <SocialTos /> }
				{ lostPasswordLink }
				{ isVIPClient && (
					<LoggedOutFormBackLink
						classes={ {
							'wp-login__main-footer-back-link': true,
						} }
						oauth2Client={ oauth2Client }
						recordClick={ recordBackToWpcomLinkClick }
					/>
				) }
			</div>
		);
	}
};

export default LoginFooter;
