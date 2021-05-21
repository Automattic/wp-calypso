/**
 * External dependencies
 */
import { Button } from '@automattic/components';
import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	EMAIL_WARNING_SLUG_GOOGLE_MAILBOX_TOS,
	EMAIL_WARNING_SLUG_UNVERIFIED_FORWARD,
} from 'calypso/lib/emails/email-provider-constants';
import {
	getEmailForwardAddress,
	hasGoogleAccountTOSWarning,
	isEmailUserAdmin,
	isGoogleEmailAccount,
} from 'calypso/lib/emails';
import { getGmailUrl, getGoogleAdminWithTosUrl } from 'calypso/lib/gsuite';
import Gridicon from 'calypso/components/gridicon';
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

	if ( isGoogleEmailAccount( account ) ) {
		if ( warningSlug === EMAIL_WARNING_SLUG_GOOGLE_MAILBOX_TOS ) {
			const emailAddress = `${ mailbox.mailbox }@${ mailbox.domain }`;

			// If the the account-level Terms of Service need to be accepted, only admins can fix that
			// issue, so ensure that we show the correct link for those users.
			// For non-admins, not much can be done until the account-level Terms have been accepted.
			if ( hasGoogleAccountTOSWarning( account ) ) {
				if ( ! isEmailUserAdmin( mailbox ) ) {
					return {
						warningText: translate( 'Action required' ),
					};
				}

				return {
					actionProps: {
						buttonText: translate( 'Finish setup' ),
						isExternal: true,
						href: getGoogleAdminWithTosUrl( emailAddress, mailbox.domain ),
						target: '_blank',
					},
					warningText: translate( 'Action required' ),
				};
			}

			// If the account-level Terms of Service have been accepted, link to Gmail for the user.
			return {
				actionProps: {
					buttonText: translate( 'Finish setup' ),
					isExternal: true,
					href: getGmailUrl( emailAddress ),
					target: '_blank',
				},
				warningText: translate( 'Action required' ),
			};
		}

		return null;
	}

	if ( isEmailForwardAccount( account ) ) {
		if ( warningSlug === EMAIL_WARNING_SLUG_UNVERIFIED_FORWARD ) {
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
