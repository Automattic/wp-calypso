export enum EmailProvider {
	Forwarding = 'email_forwarding',
	Google = 'google_workspace',
	Titan = 'titan',
}

export interface Mailbox {
	account_type: EmailProvider;
	domain: string;
	last_access_time: string | null;
	mailbox: string;
}

export interface DomainBinding {
	domain: string;
	is_primary: boolean;
}

export type Role = 'standard';

export type WarningType = 'action_required' | string;

export interface Warning {
	warning_type: WarningType;
	warning_slug: string;
	message: string;
}

// Email shapes
export interface EmailBox {
	target?: string;
	is_verified?: boolean;
	mailbox: string;
	domain: string;
	email_type: 'email' | 'email_forward';
	role: Role;
	warnings: Warning[]; // often empty
}

// Base account fields (shared)
export interface EmailAccount {
	account_type: EmailProvider;
	account_id: number | null;
	product_slug: string | null;
	maximum_mailboxes: number;
	subscription_id: number | null;
	domains: DomainBinding[];
	warnings: Warning[];
	emails: EmailBox[];
}
