import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import useResendVerifyEmailForwardMutation from 'calypso/data/emails/use-resend-verify-email-forward-mutation';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getEmailForwardAddress } from 'calypso/lib/emails';
import { EMAIL_WARNING_SLUG_UNVERIFIED_FORWARDS } from 'calypso/lib/emails/email-provider-constants';
import { isEmailForwardAccount } from 'calypso/lib/emails/is-email-forward-account';

const EmailMailboxWarningText = ( { text } ) => {
	return (
		<div className="email-mailbox-warnings__warning">
			<Gridicon icon="info-outline" size={ 18 } />

			<span>{ text }</span>
		</div>
	);
};

const EmailMailboxWarningAction = ( { buttonText, isExternal, ...otherProps } ) => {
	return (
		<div className="email-mailbox-warnings__action">
			<Button compact { ...otherProps }>
				<span>{ buttonText }</span>

				{ isExternal && <Gridicon icon="external" /> }
			</Button>
		</div>
	);
};

const EmailMailboxReverifyWarning = ( { mailbox, ctaProps } ) => {
	const translate = useTranslate();

	const { mutate: resendVerificationEmail } = useResendVerifyEmailForwardMutation( mailbox.domain );

	const warningText = translate( 'Verification required' );
	const buttonText = translate( 'Resend verification email' );

	return (
		<>
			<EmailMailboxWarningText text={ warningText } />
			<EmailMailboxWarningAction
				buttonText={ buttonText }
				onClick={ () => {
					const destination = getEmailForwardAddress( mailbox );

					recordTracksEvent(
						'calypso_email_management_email_forwarding_resend_verification_email_click',
						{
							destination,
							domain_name: mailbox.domain,
							mailbox: mailbox.mailbox,
						}
					);

					resendVerificationEmail( mailbox, destination );
				} }
				{ ...ctaProps }
			/>
		</>
	);
};

const EmailMailboxWarnings = ( { account, mailbox, ctaProps } ) => {
	if ( ! mailbox?.warnings?.length ) {
		return null;
	}

	return (
		<>
			{ mailbox.warnings.map( ( warning, index ) => {
				const warningKey = `${ mailbox.mailbox }@${ mailbox.domain }-${ warning.warning_slug }-${ index }`;

				if ( isEmailForwardAccount( account ) ) {
					if ( warning.warning_slug === EMAIL_WARNING_SLUG_UNVERIFIED_FORWARDS ) {
						return (
							<EmailMailboxReverifyWarning
								key={ warningKey }
								mailbox={ mailbox }
								ctaProps={ ctaProps }
							/>
						);
					}
				}

				return null;
			} ) }
		</>
	);
};

EmailMailboxWarnings.propTypes = {
	account: PropTypes.object.isRequired,
	mailbox: PropTypes.object.isRequired,
	ctaProps: PropTypes.object,
};

export default EmailMailboxWarnings;
