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
}

const EmailedLoginLinkSuccessfullyJetpackConnect: FC< Props > = ( { emailAddress } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	useEffect( () => {
		const enhancedRecordPageView = withEnhancers( recordPageView, [ enhanceWithSiteType ] );
		dispatch( enhancedRecordPageView( '/log-in/jetpack/link', 'Login > Link > Emailed' ) );
	}, [] );

	return (
		<div className="magic-login__successfully-jetpack">
			<RedirectWhenLoggedIn
				redirectTo="/help"
				replaceCurrentLocation
				waitForEmailAddress={ emailAddress }
			/>

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
					: translate(
							'We sent a message to your email address with a link to log in to WordPress.com.'
					  ) }
			</p>
			<p>{ preventWidows( translate( 'Only one step left—we’ll connect your site next.' ) ) }</p>
			<footer className="magic-login__successfully-jetpack-footer">
				<div className="magic-login__successfully-jetpack-footer-item">
					{ translate(
						'Didn’t get the code? Check your spam folder or {{link}}resend the email{{/link}}',
						{
							components: {
								link: <a href={ `${ window.location.href }&resend=true` } />,
							},
						}
					) }
				</div>
				<div className="magic-login__successfully-jetpack-footer-item">
					{ translate( 'Wrong email or account? {{link}}Use a different account{{/link}}', {
						components: {
							link: <a href="/log-in" />,
						},
					} ) }
				</div>
			</footer>
		</div>
	);
};

export default EmailedLoginLinkSuccessfullyJetpackConnect;
