import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { FC, useEffect } from 'react';
import RedirectWhenLoggedIn from 'calypso/components/redirect-when-logged-in';
import { preventWidows } from 'calypso/lib/formatting/prevent-widows';
import { useDispatch } from 'calypso/state';
import {
	recordPageViewWithClientId as recordPageView,
	enhanceWithSiteType,
} from 'calypso/state/analytics/actions';
import { withEnhancers } from 'calypso/state/utils';

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

	useEffect( () => {
		const enhancedRecordPageView = withEnhancers( recordPageView, [ enhanceWithSiteType ] );
		dispatch( enhancedRecordPageView( '/log-in/jetpack/link', 'Login > Link > Emailed' ) );
	}, [] );

	return (
		<div className="magic-login__successfully-jetpack">
			{ shouldRedirect && (
				<RedirectWhenLoggedIn
					redirectTo="/help"
					replaceCurrentLocation
					waitForEmailAddress={ emailAddress }
				/>
			) }

			<h1 className="magic-login__form-header">{ translate( 'Check your inbox' ) }</h1>

			<p>
				{ emailAddress
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
					: translate( 'We sent a message to log in to WordPress.com' ) }
			</p>
			<p>{ preventWidows( translate( "Only one step left—we'll connect your site next." ) ) }</p>
			<div className="magic-login__successfully-jetpack-actions">
				<p>
					{ translate(
						"Didn't get the code? Check your spam folder or {{button}}resend the email{{/button}}",
						{
							components: {
								button: (
									<Button
										className="magic-login__resend-button"
										variant="link"
										onClick={ onResendEmail }
									/>
								),
							},
						}
					) }
				</p>
				<p>
					{ translate( 'Wrong email or account? {{link}}Use a different account{{/link}}', {
						components: {
							link: <a className="magic-login__log-in-link" href="/log-in" />,
						},
					} ) }
				</p>
			</div>
		</div>
	);
};

export default EmailedLoginLinkSuccessfullyJetpackConnect;
