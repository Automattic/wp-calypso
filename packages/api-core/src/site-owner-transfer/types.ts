export type SiteOwnerTransferContext = 'dashboard_v2';

export interface SiteOwnerTransferConfirmation {
	transfer: boolean;
	email_sent: boolean;
	new_owner_email: string;
}
