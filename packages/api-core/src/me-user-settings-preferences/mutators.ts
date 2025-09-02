import { wpcom } from '../wpcom-fetcher';
import type { UserSettingsPreferences } from './types';

export async function updateUserSettingsPreferences(
	data: Partial< UserSettingsPreferences >
): Promise< Partial< UserSettingsPreferences > > {
	const saveableKeys = [
		'language',
		'locale_variant',
		'i18n_empathy_mode',
		'use_fallback_for_incomplete_languages',
	];
	for ( const key in data ) {
		if ( ! saveableKeys.includes( key ) ) {
			delete data[ key as keyof UserSettingsPreferences ];
		}
	}
	return await wpcom.req.post( '/me/settings', data );
}
