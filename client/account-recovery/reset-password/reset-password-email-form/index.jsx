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
		<Card>
			<h2 className="reset-password-email-form__title">
				{ translate( 'Reset your password' ) }
			</h2>
			<p>
				{ translate(
					"We've sent an email to {{strong}}%(email)s{{/strong}} with a link to complete your password reset.",
					{
						components: { strong: <strong /> },
						args: { email }
					}
				) }
			</p>
			<p>
				{ translate( "If you haven't received it, please check your spam or junk folder." ) }
			</p>
			<a href="#">{ translate( "Didn't receive it?" ) }</a>
		</Card>
	);
};

ResetPasswordEmailSent.defaultProps = {
	email: 'test@example.com', // TODO: Remove this default prop once this component is connected
};

export default localize( ResetPasswordEmailSent );
