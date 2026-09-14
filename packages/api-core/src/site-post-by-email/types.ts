import type { JetpackSettings } from '../site-jetpack-settings/types';

export type SitePostByEmailAction = 'create' | 'regenerate' | 'delete';

export interface SitePostByEmailStatus {
	is_enabled: boolean;
	email?: string;
}

export type SitePostByEmailSettings = Pick< Partial< JetpackSettings >, 'post_by_email_address' >;

export interface SitePostByEmailSettingsUpdate {
	post_by_email_address: SitePostByEmailAction;
}
