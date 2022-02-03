import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { getEmailForwardAddress } from 'calypso/lib/emails';
import { EMAIL_WARNING_SLUG_UNVERIFIED_FORWARDS } from 'calypso/lib/emails/email-provider-constants';
import { isEmailForwardAccount } from 'calypso/lib/emails/is-email-forward-account';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { resendVerificationEmail } from 'calypso/state/email-forwarding/actions';

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

const resendEmailForwardVerification = ( mailbox, dispatch ) => {
	const destination = getEmailForwardAddress( mailbox );

	dispatch(
		recordTracksEvent(
			'calypso_email_management_email_forwarding_resend_verification_email_click',
			{
				destination,
				domain_name: mailbox.domain,
				mailbox: mailbox.mailbox,
			}
		)
	);

	dispatch( resendVerificationEmail( mailbox.domain, mailbox.mailbox, destination ) );
};

const getDetailsForWarning = ( { account, dispatch, mailbox, translate, warning } ) => {
	const warningSlug = warning.warning_slug;

	if ( isEmailForwardAccount( account ) ) {
		if ( warningSlug === EMAIL_WARNING_SLUG_UNVERIFIED_FORWARDS ) {
			return {
				actionProps: {
					buttonText: translate( 'Resend verification email' ),
					onClick: () => resendEmailForwardVerification( mailbox, dispatch ),
				},
				warningText: translate( 'Verification required' ),
			};
		}

		return null;
	}

	return null;
};

const EmailMailboxWarning = ( { actionProps, text } ) => {
	return (
		<>
			<EmailMailboxWarningText text={ text } />
			{ actionProps && <EmailMailboxWarningAction { ...actionProps } /> }
		</>
	);
};

const EmailMailboxWarnings = ( { account, mailbox } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	if ( ! mailbox?.warnings?.length ) {
		return null;
	}

	return (
		<>
			{ mailbox.warnings.map( ( warning, index ) => {
				const warningKey = `${ mailbox.mailbox }@${ mailbox.domain }-${ warning.warning_slug }-${ index }`;

				const warningDetails = getDetailsForWarning( {
					account,
					dispatch,
					mailbox,
					translate,
					warning,
				} );

				return (
					<EmailMailboxWarning
						key={ warningKey }
						actionProps={ warningDetails?.actionProps }
						text={ warningDetails?.warningText }
					/>
				);
			} ) }
		</>
	);
};

EmailMailboxWarnings.propTypes = {
	account: PropTypes.object.isRequired,
	mailbox: PropTypes.object.isRequired,
};

export default EmailMailboxWarnings;
