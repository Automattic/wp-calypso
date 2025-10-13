import { EmailProvider } from '@automattic/api-core';

export interface Email {
	id: string;
	emailAddress: string;
	type: 'mailbox' | 'forwarding';
	provider: EmailProvider;
	providerDisplayName: string;
	domainName: string;
	subscriptionId?: string;
	siteId?: string;
	siteName?: string;
	forwardingTo?: string;
	storageUsed?: number;
	storageLimit?: number;
	canUserManage: boolean;
	status:
		| 'active'
		| 'pending'
		| 'suspended'
		| 'google_pending_tos_acceptance'
		| 'unverified_forwards'
		| 'no_subscription'
		| 'unused_mailboxes';
}
