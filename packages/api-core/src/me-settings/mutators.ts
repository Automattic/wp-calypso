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
		'two_step_sms_country',
		'two_step_sms_phone_number',
	];
	const payload = Object.fromEntries(
		saveableKeys.filter( ( key ) => key in data ).map( ( key ) => [ key, data[ key ] ] )
	);
	return await wpcom.req.post( '/me/settings', payload );
}
