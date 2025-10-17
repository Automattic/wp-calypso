import { wpcom } from '../wpcom-fetcher';
import type { UserSettings } from './types';

export async function fetchUserSettings(): Promise< UserSettings > {
	return await wpcom.req.get( '/me/settings' );
}
