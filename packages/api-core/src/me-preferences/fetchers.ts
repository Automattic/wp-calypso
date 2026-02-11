import { wpcom } from '../wpcom-fetcher';
import type { CalypsoUserPreferencesResponseBody, UserPreferences } from './types';

export async function fetchPreferences(): Promise< UserPreferences > {
	const { calypso_preferences } = await ( wpcom.req.get(
		'/me/preferences'
	) as Promise< CalypsoUserPreferencesResponseBody > );
	return calypso_preferences;
}
