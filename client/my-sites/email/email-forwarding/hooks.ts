import { useCallback } from 'react';
import useRemoveEmailForwardMutation from 'calypso/data/emails/use-remove-email-forward-mutation';
import useResendVerifyEmailForwardMutation from 'calypso/data/emails/use-resend-verify-email-forward-mutation';
import useUpdateEmailForwardMutation from 'calypso/data/emails/use-update-email-forward-mutation';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Mailbox } from 'calypso/data/emails/types';

export function useRemove( { mailbox }: { mailbox: Mailbox } ) {
	const { mutate: removeEmailForward } = useRemoveEmailForwardMutation( mailbox.domain );

	return useCallback(
		( mailbox: string, domain: string, destination: string ) => {
			recordTracksEvent( 'calypso_email_management_email_forwarding_delete_click', {
				destination,
				domain_name: domain,
				mailbox: mailbox,
			} );

			removeEmailForward( {
				mailbox: mailbox,
				destination,
				domain,
			} );
		},
		[ removeEmailForward ]
	);
}

export function useResend( { mailbox }: { mailbox: Mailbox } ) {
	const { mutate: resendVerificationEmail } = useResendVerifyEmailForwardMutation( mailbox.domain );

	return useCallback(
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
}

export function useEdit( { mailbox }: { mailbox: Mailbox } ) {
	const { mutateAsync: updateEmailForward, isPending } = useUpdateEmailForwardMutation(
		mailbox.domain
	);

	const edit = useCallback(
		( params: {
			mailbox: string;
			domain: string;
			destination: string;
			newDestination: string;
		} ) => {
			recordTracksEvent( 'calypso_email_management_email_forwarding_edit_click', {
				destination: params.destination,
				new_destination: params.newDestination,
				domain_name: params.domain,
				mailbox: params.mailbox,
			} );

			return updateEmailForward( params );
		},
		[ updateEmailForward ]
	);

	return { edit, isPending };
}
