import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useSelector } from 'react-redux';
import LoggedOutFormBackLink from 'calypso/components/logged-out-form/back-link';
import { isVIPOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';

interface LoginFooterProps {
	lostPasswordLink: JSX.Element;
	loginLink: string;
	isLoginView?: boolean;
}

const recordBackToWpcomLinkClick = () => {
	recordTracksEvent( 'calypso_login_back_to_wpcom_link_click' );
};

const LoginBlockFooter = ( { lostPasswordLink, isLoginView, loginLink }: LoginFooterProps ) => {
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isVIPClient = isVIPOAuth2Client( oauth2Client );

	if ( ! lostPasswordLink ) {
		return null;
	}

	if ( isLoginView ) {
		return (
			<div className="wp-login__login-block-footer">
				{ lostPasswordLink }
				{ isVIPClient && (
					<LoggedOutFormBackLink
						classes={ {
							'logged-out-form__link-item': false,
							'logged-out-form__back-link': false,
							'wp-login__login-block-footer-back-link': true,
						} }
						oauth2Client={ oauth2Client }
						recordClick={ recordBackToWpcomLinkClick }
					/>
				) }
			</div>
		);
	}

	return <div className="wp-login__login-block-footer">{ loginLink }</div>;
};

export default LoginBlockFooter;
