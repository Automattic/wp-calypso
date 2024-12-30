export type EmailAccountEmail = {
	domain: string;
	email_type: string;
	is_verified: boolean;
	mailbox: string;
	role: string;
	target: string;
	temporary?: boolean;
	warnings: Warning[];
};

type EmailAccountDomain = {
	domain: string;
	is_primary: boolean;
};

type Warning = {
	message: string;
	warning_slug: string;
	warning_type: string;
};

// Comes from the `/sites/${ siteId }/emails/accounts/${ domain }/mailboxes` API endpoint
export type EmailAccount = {
	account_id?: number;
	account_type:
		| 'email_forwarding'
		| 'google_workspace'
		| 'google_gsuite'
		| 'titan'
		| 'titan_external';
	domains: EmailAccountDomain[];
	emails: EmailAccountEmail[];
	maximum_mailboxes: number;
	product_slug?: string;
	subscription_id?: number;
	warnings: Warning[];
};

// Comes from the `/sites/${ siteId }/emails/mailboxes` API endpoint
export type Mailbox = {
	account_type: string;
	domain: string;
	last_access_time?: string;
	mailbox: string;
	warnings?: Warning[];
	temporary?: boolean;
};
