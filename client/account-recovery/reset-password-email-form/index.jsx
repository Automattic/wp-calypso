/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { clearResetMethod } from 'state/account-recovery/reset/actions';

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
			<Button onClick={ props.clearResetMethod } borderless>{ translate( "Didn't receive it?" ) }</Button>
		</Card>
	);
};

export default connect( null, { clearResetMethod } )( localize( ResetPasswordEmailSent ) );
