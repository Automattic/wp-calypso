import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useSelector } from 'react-redux';
import LoggedOutFormBackLink from 'calypso/components/logged-out-form/back-link';
import { isVIPOAuth2Client } from 'calypso/lib/oauth2-clients';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import './one-login-footer.scss';

interface OneLoginFooterProps {
	/**
	 * when `isLoginView` is true, this is the "lost password" link
	 */
	lostPasswordLink?: JSX.Element;
	/**
	 * when `isLoginView` is false, this is the "back to login" link
	 */
	loginLink?: JSX.Element;
	/**
	 * when `isLoginView` is false, this is the "support" link
	 */
	supportLink?: JSX.Element;
	/**
	 * when true, this is the footer for the main login screen
	 */
	isLoginView?: boolean;
}

const recordBackToWpcomLinkClick = () => {
	recordTracksEvent( 'calypso_login_back_to_wpcom_link_click' );
};

const OneLoginFooter = ( {
	lostPasswordLink,
	loginLink,
	isLoginView,
	supportLink,
}: OneLoginFooterProps ) => {
	const oauth2Client = useSelector( getCurrentOAuth2Client ) as {
		name: string;
		image: string;
	} | null;
	const isVIPClient = isVIPOAuth2Client( oauth2Client );

	if ( isLoginView ) {
		return (
			<div className="one-login__footer">
				{ lostPasswordLink }
				{ isVIPClient && (
					<LoggedOutFormBackLink
						classes={ {
							'logged-out-form__link-item': false,
							'logged-out-form__back-link': false,
							'one-login__footer-link': true,
						} }
						oauth2Client={ oauth2Client }
						recordClick={ recordBackToWpcomLinkClick }
					/>
				) }
			</div>
		);
	}

	return (
		<div className="one-login__footer">
			{ loginLink }
			{ supportLink }
		</div>
	);
};

export default OneLoginFooter;
