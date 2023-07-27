import { NextButton, SubTitle, Title } from '@automattic/onboarding';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';

const VerifyEmail = function SitePicker() {
	const { __ } = useI18n();

	return (
		<div className="verify-email--container">
			<Title>{ __( 'Verify your email address' ) }</Title>
			<SubTitle>
				{ sprintf(
					// translators: %s is the email address of current user
					__(
						'To start your Business plan 7-day trial, verify your email address by clicking the link we sent you to %(email)s.'
					),
					{ email: 'username@email.com' }
				) }
			</SubTitle>
			<NextButton>{ __( 'Resend verification email' ) }</NextButton>
		</div>
	);
};

export default VerifyEmail;
