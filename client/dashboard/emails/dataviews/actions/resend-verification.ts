import { resendVerifyEmailForwardMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../../app/analytics';
import type { Email } from '../../types';
import type { Action } from '@wordpress/dataviews';

export const useResendVerificationAction = (): Action< Email > => {
	const { mutateAsync: resendEmailForwardVerification } = useMutation(
		resendVerifyEmailForwardMutation()
	);
	const { createSuccessNotice, createErrorNotice } = useDispatch( noticesStore );
	const { recordTracksEvent } = useAnalytics();

	return {
		id: 'resend-verification',
		label: __( 'Resend verification' ),
		callback: ( items: Email[] ) => {
			recordTracksEvent( 'calypso_dashboard_emails_action_click', {
				action_id: 'resend-verification',
			} );
			const email = items[ 0 ];

			const mailbox = email.emailAddress.split( '@' )[ 0 ];

			resendEmailForwardVerification( {
				domainName: email.domainName,
				mailbox,
				destination: email.forwardingTo as string,
			} )
				.then( () => {
					recordTracksEvent( 'calypso_dashboard_emails_action_success', {
						action_id: 'resend-verification',
					} );
					createSuccessNotice(
						sprintf(
							/* translators: %1$s is the forwarding source email address, %2$s is the destination address. */
							__( 'Successfully sent confirmation email for %1$s to %2$s.' ),
							email.emailAddress,
							email.forwardingTo
						),
						{ type: 'snackbar' }
					);
				} )
				.catch( () => {
					recordTracksEvent( 'calypso_dashboard_emails_action_error', {
						action_id: 'resend-verification',
					} );
					createErrorNotice(
						sprintf(
							/* translators: %1$s is the forwarding source email address, %2$s is the destination address. */
							__( 'Failed to send confirmation email for %1$s to %2$s. Please try again.' ),
							email.emailAddress,
							email.forwardingTo
						),
						{ type: 'snackbar' }
					);
				} );
		},
		isEligible: ( item: Email ) =>
			item.type === 'forwarding' &&
			item.status === 'unverified_forwards' &&
			!! ( item?.forwardingTo ?? false ),
	};
};
