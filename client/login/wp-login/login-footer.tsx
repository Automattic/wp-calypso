import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useSelector } from 'react-redux';
import SocialTos from 'calypso/blocks/authentication/social/social-tos';
import LoggedOutFormBackLink from 'calypso/components/logged-out-form/back-link';
import { isVIPOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';

interface LoginFooterProps {
	lostPasswordLink: JSX.Element;
	shouldRenderTos: boolean;
}

const recordBackToWpcomLinkClick = () => {
	recordTracksEvent( 'calypso_login_back_to_wpcom_link_click' );
};

const LoginFooter = ( { lostPasswordLink, shouldRenderTos }: LoginFooterProps ) => {
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isVIPClient = isVIPOAuth2Client( oauth2Client );

	if ( ! lostPasswordLink && ! shouldRenderTos ) {
		return null;
	}

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
};

export default LoginFooter;
