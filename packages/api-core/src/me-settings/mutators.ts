import { wpcom } from '../wpcom-fetcher';
import type { UserSettings } from './types';

export async function updateUserSettings(
	data: Partial< UserSettings >
): Promise< Partial< UserSettings > > {
	const saveableKeys: ( keyof UserSettings )[] = [
		'first_name',
		'last_name',
		'user_email',
		'advertising_targeting_opt_out',
		'display_name',
		'description',
		'is_dev_account',
		'password',
		'tracks_opt_out',
		'user_URL',
		'language',
		'locale_variant',
		'i18n_empathy_mode',
		'use_fallback_for_incomplete_languages',
		'enable_translator',
		'subscription_delivery_email_blocked',
		'subscription_delivery_email_default',
		'subscription_delivery_mail_option',
		'subscription_delivery_day',
		'subscription_delivery_hour',
		'subscription_delivery_jabber_default',
		'p2_disable_autofollow_on_comment',
		'two_step_sms_country',
		'two_step_sms_phone_number',
		'two_step_enhanced_security',
		'primary_site_ID',
		'mcp_abilities',
		'user_email_change_pending',
	];
	const payload = Object.fromEntries(
		saveableKeys.filter( ( key ) => key in data ).map( ( key ) => [ key, data[ key ] ] )
	);
	return await wpcom.req.post( '/me/settings', payload );
}
