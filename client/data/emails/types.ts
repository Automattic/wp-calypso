export type EmailForward = {
	domain: string;
	email_type: 'email_forward';
	is_verified: boolean;
	mailbox: string;
	role: string;
	target: string;
	warnings: any[];
};
