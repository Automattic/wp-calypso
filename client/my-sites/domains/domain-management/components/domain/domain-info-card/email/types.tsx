export type Mailbox = {
	domain: string;
	mailbox: string;
};

export type EmailAccount = {
	account_type: string;
	emails: Mailbox[];
};
