/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';

const ResetPasswordEmailSent = ( props ) => {
	const {
		// TODO: uncomment it once the real data got wired
		// email,
		translate,
	} = props;

	return (
		<div className="reset-password-email-form">
			<h2 className="reset-password-email-form__title">
				{ translate( 'Reset your password' ) }
			</h2>
			<Card>
			<p>
				{ translate(
					'We have sent an email to {{strong}}%(email)s{{/strong}} with a reset link. ' +
					'Click on it to reset your password and recover access to your account.',
					{
						components: { strong: <strong /> },
						// TODO: it will become args: { email } when the real data got wired in the up-coming PR.
						// args: { email }
						args: { email: 'test@example.com' }
					}
				) }
			</p>
			<p>
				{ translate( "If you don't find it, please check your spam or junk folder too." ) }
			</p>
			<a href="#">{ translate( "You didn't receive it?" ) }</a>
			</Card>
		</div>
	);
};

export default localize( ResetPasswordEmailSent );
