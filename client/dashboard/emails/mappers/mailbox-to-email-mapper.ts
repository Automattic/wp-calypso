import { EmailAccount, EmailBox } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { accountHasWarningWithSlug } from '../../utils/email-utils';
import type { Email } from '../types';

export const mapMailboxToEmail = ( box: EmailBox, emailAccount: EmailAccount ): Email => {
	const provider = emailAccount.account_type;

	let providerDisplayName: string = __( 'Email Forwarding' );
	if ( provider === 'titan' ) {
		providerDisplayName = __( 'Titan Mail' );
	} else if ( provider === 'google_workspace' ) {
		providerDisplayName = __( 'Google Workspace' );
	}

	const type: Email[ 'type' ] = provider === 'email_forwarding' ? 'forwarding' : 'mailbox';

	const id: string = box.domain + box.mailbox + box?.target;

	// Infer status from known subscriptions or warnings
	let status: Email[ 'status' ] = emailAccount.status;

	// Titan refused to delete this mailbox, so it still exists.
	const deletionRefusedWarning =
		provider === 'titan'
			? ( box.warnings ?? [] ).find( ( warning ) => warning.warning_slug === 'deletion_refused' )
			: undefined;

	// A pending deletion wins over any warning, such as the domain being removed.
	if ( box.status === 'pending_deletion' ) {
		status = 'pending_deletion';
	} else if ( deletionRefusedWarning ) {
		status = 'deletion_refused';
	} else if ( box.warnings.length > 0 || emailAccount.warnings.length > 0 ) {
		status = 'pending';
		// The API also sends 'domain_not_connected' with this warning, so check it first.
		if ( accountHasWarningWithSlug( 'mx_records_missing', emailAccount ) ) {
			status = 'mx_records_missing';
		} else if ( accountHasWarningWithSlug( 'domain_not_connected', emailAccount ) ) {
			status = 'domain_not_connected';
		} else if ( accountHasWarningWithSlug( 'google_pending_tos_acceptance', emailAccount ) ) {
			status = 'google_pending_tos_acceptance';
		} else if ( accountHasWarningWithSlug( 'unverified_forwards', emailAccount ) ) {
			status = 'unverified_forwards';
		} else if ( accountHasWarningWithSlug( 'unused_mailboxes', emailAccount ) ) {
			status = 'unused_mailboxes';
		}
	}

	return {
		id,
		subscriptionId: emailAccount.subscription_id?.toString() ?? emailAccount.account_id?.toString(),
		productSlug: emailAccount.product_slug ?? undefined,
		emailAddress: `${ box.mailbox }@${ box.domain }`,
		type,
		provider,
		forwardingTo: box.target,
		providerDisplayName,
		domainName: box.domain,
		status,
		deletionRefusedMessage: deletionRefusedWarning?.message,
	};
};
