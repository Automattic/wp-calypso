export enum EmailProvider {
	Forwarding = 'email_forwarding',
	Google = 'google_workspace',
	Titan = 'titan',
}

/**
 * Sections of Titan's control panel that the auto-login URL can deep-link to.
 */
export const TitanControlPanelContext = {
	CONFIGURE_CATCH_ALL_EMAIL: 'configure_catch_all_email',
	CONFIGURE_DESKTOP_APP: 'configure_desktop_app',
	CONFIGURE_INTERNAL_FORWARDING: 'configure_internal_forwarding',
	CREATE_EMAIL: 'create_email_account',
	GET_MOBILE_APP: 'get_mobile_app',
	IMPORT_EMAIL_DATA: 'import_email_data',
} as const;

export type TitanControlPanelContext =
	( typeof TitanControlPanelContext )[ keyof typeof TitanControlPanelContext ];

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
	status: 'active' | 'pending' | 'suspended' | 'no_subscription' | 'other_provider';
	can_user_add_email: boolean;
}
