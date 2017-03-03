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
		email,
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
						args: { email }
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

ResetPasswordEmailSent.defaultProps = {
	email: 'test@example.com', // TODO: Remove this default prop once this component is connected
};

export default localize( ResetPasswordEmailSent );
