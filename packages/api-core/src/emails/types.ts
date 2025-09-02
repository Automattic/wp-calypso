export type EmailProvider = 'titan' | 'google_workspace' | 'email_forwarding';

export interface Mailbox {
	account_type: EmailProvider;
	domain: string;
	last_access_time: string | null;
	mailbox: string;
}

export interface Email {
	id: string;
	emailAddress: string;
	type: 'mailbox' | 'forwarding';
	provider: EmailProvider;
	providerDisplayName: string;
	domainName: string;
	siteId?: string;
	siteName?: string;
	forwardingTo?: string;
	storageUsed?: number;
	storageLimit?: number;
	createdDate: string;
	status: 'active' | 'pending' | 'suspended';
}
