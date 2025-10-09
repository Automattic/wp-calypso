import { EmailAccount, EmailBox, SiteDomain } from '@automattic/api-core';
import { __ } from '@wordpress/i18n';
import { accountHasWarningWithSlug } from '../../utils/email-utils';
import type { Email } from '../types';

export const mapMailboxToEmail = (
	box: EmailBox,
	emailAccount: EmailAccount,
	domain: SiteDomain
): Email => {
	const provider = emailAccount.account_type;

	let providerDisplayName = __( 'Email Forwarding' );
	if ( provider === 'titan' ) {
		providerDisplayName = __( 'Titan Mail' );
	} else if ( provider === 'google_workspace' ) {
		providerDisplayName = __( 'Google Workspace' );
	}

	const type: Email[ 'type' ] = provider === 'email_forwarding' ? 'forwarding' : 'mailbox';

	const id: string = box.domain + box.mailbox + box?.target;

	// Infer status from known subscriptions or warnings
	let status: Email[ 'status' ] = 'active';
	if ( box.warnings.length > 0 || emailAccount.warnings.length > 0 ) {
		status = 'pending';
		if ( accountHasWarningWithSlug( 'google_pending_tos_acceptance', emailAccount ) ) {
			status = 'google_pending_tos_acceptance';
		} else if ( accountHasWarningWithSlug( 'unverified_forwards', emailAccount ) ) {
			status = 'unverified_forwards';
		} else if ( accountHasWarningWithSlug( 'unused_mailboxes', emailAccount ) ) {
			status = 'unused_mailboxes';
		}
	} else if ( provider === 'titan' && domain.titan_mail_subscription?.status ) {
		status = domain.titan_mail_subscription.status;
	} else if ( provider === 'google_workspace' && domain.google_apps_subscription?.status ) {
		status = domain.google_apps_subscription.status;
	}

	return {
		id,
		subscriptionId: String( emailAccount.subscription_id ) ?? emailAccount.account_id,
		emailAddress: `${ box.mailbox }@${ box.domain }`,
		type,
		provider,
		forwardingTo: box.target,
		providerDisplayName,
		domainName: box.domain,
		siteId: String( domain.blog_id ),
		siteName: domain.blog_name,
		status,
		canUserManage: domain.current_user_can_add_email,
	};
};
