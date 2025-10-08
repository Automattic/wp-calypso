import { __ } from '@wordpress/i18n';
import type { Email } from '../types';
import type { Action } from '@wordpress/dataviews';

export const buildResendVerificationAction = (
	resendEmailForwardVerification: ( {
		domainName,
		mailbox,
		destination,
	}: {
		domainName: string;
		mailbox: string;
		destination: string;
	} ) => Promise< void >
): Action< Email > => ( {
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
			destination: email.forwardingTo as string,
		} );
	},
	isEligible: ( item: Email ) =>
		item.type === 'forwarding' && item.status === 'unverified_forwards',
} );
