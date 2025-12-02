import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FC, useEffect } from 'react';
import RedirectWhenLoggedIn from 'calypso/components/redirect-when-logged-in';
import { preventWidows } from 'calypso/lib/formatting/prevent-widows';
import OneLoginFooter from 'calypso/login/wp-login/components/one-login-footer';
import { useDispatch } from 'calypso/state';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';
import { useLoginContext } from '../login-context';

interface Props {
	emailAddress: string;
	shouldRedirect?: boolean;
	onResendEmail: () => void;
}

const EmailedLoginLinkSuccessfullyJetpackConnect: FC< Props > = ( {
	emailAddress,
	shouldRedirect = true,
	onResendEmail,
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { setHeaders } = useLoginContext();

	useEffect( () => {
		const enhancedRecordPageView = withEnhancers( recordPageView, [ enhanceWithSiteType ] );
		dispatch( enhancedRecordPageView( '/log-in/jetpack/link', 'Login > Link > Emailed' ) );
	}, [ dispatch ] );

	useEffect( () => {
		setHeaders( {
			heading: translate( 'Check your email' ),
			subHeading: emailAddress
				? translate(
						'We sent a message to {{strong}}%(emailAddress)s{{/strong}} with a link to log in to WordPress.com.',
						{
							args: {
								emailAddress,
							},
							components: {
								strong: <strong />,
							},
						}
				  )
				: translate( 'We sent a message to log in to WordPress.com' ),
		} );
	}, [ setHeaders, translate, emailAddress ] );

	return (
		<div className="magic-login__successfully-jetpack">
			{ shouldRedirect && (
				<RedirectWhenLoggedIn
					redirectTo="/help"
					replaceCurrentLocation
					waitForEmailAddress={ emailAddress }
				/>
			) }
			<p>{ preventWidows( translate( "Only one step left—we'll connect your site next." ) ) }</p>
			<OneLoginFooter>
				<p className="one-login__footer-text">
					{ translate(
						"Didn't get the email? Check your spam folder, or {{button}}resend the email{{/button}}. Wrong email or account? {{link}}Use a different account{{/link}}.",
						{
							components: {
								button: (
									<Button
										variant="link"
										onClick={ onResendEmail }
										className="one-login__footer-link"
									/>
								),
								link: <a className="one-login__footer-link" href="/log-in/jetpack" />,
							},
						}
					) }
				</p>
			</OneLoginFooter>
		</div>
	);
};

export default EmailedLoginLinkSuccessfullyJetpackConnect;
