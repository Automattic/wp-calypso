import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import useResendVerifyEmailForwardMutation from 'calypso/data/emails/use-resend-verify-email-forward-mutation';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getEmailForwardAddress } from 'calypso/lib/emails';
import { Mailbox } from '../../../../data/emails/types';
import './style.scss';

export function ResendButton( { mailbox }: { mailbox: Mailbox } ) {
	const { mutate: resendVerificationEmail } = useResendVerifyEmailForwardMutation( mailbox.domain );
	const translate = useTranslate();

	const resend = useCallback(
		( mailbox: string, domain: string, destination: string ) => {
			recordTracksEvent(
				'calypso_email_management_email_forwarding_resend_verification_email_click',
				{
					destination,
					domain_name: domain,
					mailbox: mailbox,
				}
			);

			resendVerificationEmail( { mailbox, destination, domain } );
		},
		[ resendVerificationEmail ]
	);

	return (
		<Button
			variant="link"
			className="email-forward-resend-button"
			onClick={ () => resend( mailbox.mailbox, mailbox.domain, getEmailForwardAddress( mailbox ) ) }
		>
			{ translate( 'Resend' ) }
		</Button>
	);
}
