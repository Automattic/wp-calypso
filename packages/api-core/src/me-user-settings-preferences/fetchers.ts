import { wpcom } from '../wpcom-fetcher';
import type { UserSettingsPreferences } from './types';

export async function fetchUserSettingsPreferences(): Promise< UserSettingsPreferences > {
	return await wpcom.req.get( '/me/settings' );
}
