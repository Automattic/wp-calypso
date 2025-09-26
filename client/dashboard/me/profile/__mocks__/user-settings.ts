import type { UserSettings } from '@automattic/api-core';

export const mockUserSettings: UserSettings = {
	advertising_targeting_opt_out: false,
	avatar_URL: 'https://gravatar.com/avatar/test',
	description: 'Test description',
	display_name: 'Test User',
	is_dev_account: false,
	password: 'password',
	is_passwordless_user: false,
	tracks_opt_out: false,
	user_email: 'test@example.com',
	user_login: 'testuser',
	user_URL: 'https://example.com',
	first_name: 'Test First Name',
	last_name: 'Test Last Name',
	two_step_app_enabled: false,
	two_step_backup_codes_printed: false,
	two_step_enabled: false,
	two_step_enhanced_security: false,
	two_step_enhanced_security_forced: false,
	two_step_security_key_enabled: false,
	two_step_sms_country: 'US',
	two_step_sms_enabled: false,
	two_step_sms_phone_number: '1234567890',
	subscription_delivery_email_default: 'daily',
	subscription_delivery_mail_option: 'html',
	subscription_delivery_day: 1,
	subscription_delivery_hour: 12,
	subscription_delivery_jabber_default: false,
	p2_disable_autofollow_on_comment: false,
	email_verified: true,
	user_login_can_be_changed: true,
};

export const mockAutomatticianUserSettings: UserSettings = {
	...mockUserSettings,
	user_login: 'automattician',
	user_email: 'automattician@automattic.com',
};

export const mockUnverifiedEmailUserSettings: UserSettings = {
	...mockUserSettings,
	email_verified: false,
};

export const mockCannotChangeUsernameSettings: UserSettings = {
	...mockUserSettings,
	user_login_can_be_changed: false,
};
