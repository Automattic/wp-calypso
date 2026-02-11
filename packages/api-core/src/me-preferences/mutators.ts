import { wpcom } from '../wpcom-fetcher';
import type { CalypsoUserPreferencesRequestBody, UserPreferences } from './types';

export async function updatePreferences(
	data: Partial< UserPreferences >
): Promise< UserPreferences > {
	const { calypso_preferences } = await wpcom.req.post( '/me/preferences', {
		calypso_preferences: data,
	} satisfies CalypsoUserPreferencesRequestBody );

	return calypso_preferences;
}
