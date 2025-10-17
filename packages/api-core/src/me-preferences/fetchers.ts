import { wpcom } from '../wpcom-fetcher';
import type { UserPreferences } from './types';

export async function fetchPreferences(): Promise< UserPreferences > {
	const { calypso_preferences } = await wpcom.req.get( '/me/preferences' );
	return calypso_preferences;
}
