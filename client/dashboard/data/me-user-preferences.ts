import wpcom from 'calypso/lib/wp';

export interface UserSettingsPreferences {
	language?: string;
	locale_variant?: string;
	i18n_empathy_mode?: boolean;
	use_fallback_for_incomplete_languages?: boolean;
}

export async function fetchUserPreferences(): Promise< UserSettingsPreferences > {
	return await wpcom.req.get( '/me/settings' );
}

export async function updateUserPreferences(
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
