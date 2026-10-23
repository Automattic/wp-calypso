import { recordTracksEvent } from '@automattic/calypso-analytics';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { type JSX } from 'react';
import { useSelector } from 'react-redux';
import LoggedOutFormBackLink from 'calypso/components/logged-out-form/back-link';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import useSignupLink from '../hooks/use-signup-link';
import './one-login-footer.scss';

interface OneLoginFooterProps {
	/**
	 * When `isLoginView` is true, the "lost password" link. See `lostPasswordLinkMobileOnly`
	 * for when it is hidden on desktop.
	 */
	lostPasswordLink?: JSX.Element;
	/**
	 * Hides `lostPasswordLink` at 960px and up. Pass it when the form carries its own copy
	 * there; Woo and Gravatar-powered logins do not, and keep the footer's at every width.
	 */
	lostPasswordLinkMobileOnly?: boolean;
	/**
	 * When `isLoginView` is false, this is the "back to login" link.
	 */
	loginLink?: JSX.Element;
	/**
	 * Shows "Don't have an account? Sign up" below the buttons at 960px and up.
	 */
	showSignupPrompt?: boolean;
	/**
	 * Passed through to the signup link so an explicit `?signup_url` is honoured.
	 */
	signupUrl?: string;
	/**
	 * The content of the footer. If provided, it will be rendered instead of the default links.
	 */
	children?: React.ReactNode;
	/**
	 * When `isLoginView` is false, this is the "support" link.
	 */
	supportLink?: JSX.Element;
	/**
	 * When true, this is the footer for the main login screen.
	 */
	isLoginView?: boolean;
}

const recordBackToWpcomLinkClick = () => {
	recordTracksEvent( 'calypso_login_back_to_wpcom_link_click' );
};

/**
 * The route to signup, placed and worded like signup's route to login.
 */
const SignUpPrompt = ( { signupUrl }: { signupUrl?: string } ) => {
	const translate = useTranslate();
	const { href, onClick } = useSignupLink( { signupUrl, origin: 'login-footer' } );

	return (
		<p className="one-login__footer-signup">
			{ translate( 'Don’t have an account? {{signupLink}}Sign up{{/signupLink}}', {
				components: {
					// eslint-disable-next-line jsx-a11y/anchor-has-content
					signupLink: <a href={ href } onClick={ onClick } rel="external" />,
				},
			} ) }
		</p>
	);
};

const OneLoginFooter = ( {
	lostPasswordLink,
	lostPasswordLinkMobileOnly,
	loginLink,
	showSignupPrompt,
	signupUrl,
	isLoginView,
	supportLink,
	children,
}: OneLoginFooterProps ) => {
	const oauth2Client = useSelector( getCurrentOAuth2Client );

	if ( isLoginView ) {
		// Both are rendered and one is hidden in CSS: the page is server-rendered, so a viewport
		// hook would jump on hydration.
		return (
			<div className="one-login__footer">
				<div
					className={ clsx( 'one-login__footer-links-wrapper', {
						'one-login__footer-mobile': lostPasswordLinkMobileOnly,
					} ) }
				>
					{ lostPasswordLink }
				</div>
				{ showSignupPrompt && <SignUpPrompt signupUrl={ signupUrl } /> }
				<div className="one-login__footer-links-wrapper">
					{ oauth2Client && (
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
			</div>
		);
	}

	return (
		<div className="one-login__footer">
			{ children ? (
				children
			) : (
				<div className="one-login__footer-links-wrapper">
					{ loginLink }
					{ supportLink }
				</div>
			) }
		</div>
	);
};

export default OneLoginFooter;
