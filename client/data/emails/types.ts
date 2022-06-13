export type EmailAccountEmail = {
	domain: string;
	email_type: string;
	is_verified: boolean;
	mailbox: string;
	role: string;
	target: string;
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

export type EmailAccount = {
	account_id?: number;
	account_type: string;
	domains: EmailAccountDomain[];
	emails: EmailAccountEmail[];
	maximum_mailboxes: number;
	product_slug?: string;
	subscription_id?: number;
	warnings: Warning[];
};

export type Mailbox = {
	account_type: string;
	domain: string;
	last_access_time?: string;
	mailbox: string;
};
