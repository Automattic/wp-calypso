import { wpcom } from '../wpcom-fetcher';
import type { UserSettingsPreferences } from './types';

export async function updateUserSettingsPreferences(
	data: Partial< UserSettingsPreferences >
): Promise< Partial< UserSettingsPreferences > > {
	const saveableKeys: ( keyof UserSettingsPreferences )[] = [
		'language',
		'locale_variant',
		'i18n_empathy_mode',
		'use_fallback_for_incomplete_languages',
		'enable_translator',
	];
	const payload = Object.fromEntries(
		saveableKeys.filter( ( key ) => key in data ).map( ( key ) => [ key, data[ key ] ] )
	);
	return await wpcom.req.post( '/me/settings', payload );
}
