import { resendVerifyEmailForwardMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export const useResendVerificationAction = (): Action< Email > => {
	const { mutateAsync: resendEmailForwardVerification } = useMutation(
		resendVerifyEmailForwardMutation()
	);
	const { createSuccessNotice } = useDispatch( noticesStore );

	return {
		id: 'resend-verification',
		label: __( 'Resend verification' ),
		callback: ( items: Email[] ) => {
			const email = items[ 0 ];
			if ( email.type !== 'forwarding' || ! email?.forwardingTo ) {
				return;
			}

			const mailbox = email.emailAddress.split( '@' )[ 0 ];

			resendEmailForwardVerification( {
				domainName: email.domainName,
				mailbox,
				destination: email.forwardingTo,
			} ).then( () => {
				createSuccessNotice(
					sprintf(
						/* translators: %1$s is the forwarding source email address, %2$s is the destination address. */
						__( 'Successfully sent confirmation email for %1$s to %2$s.' ),
						email.emailAddress,
						email.forwardingTo
					),
					{ type: 'snackbar' }
				);
			} );
		},
		isEligible: ( item: Email ) =>
			item.type === 'forwarding' && item.status === 'unverified_forwards',
	};
};
