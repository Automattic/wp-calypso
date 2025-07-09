import wpcom from 'calypso/lib/wp';

export interface UserPreferences {
	'sites-view'?: Record< string, unknown >;
}

export async function fetchPreferences(): Promise< UserPreferences > {
	const { calypso_preferences } = await wpcom.req.get( '/me/preferences' );
	return calypso_preferences;
}

export async function updatePreferences( data: Partial< UserPreferences > ) {
	const { calypso_preferences } = await wpcom.req.post( '/me/preferences', {
		calypso_preferences: data,
	} );

	return calypso_preferences;
}
