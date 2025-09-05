import { wpcom } from '../wpcom-fetcher';
import type { UserSettings } from './types';

export async function updateUserSettings(
	data: Partial< UserSettings >
): Promise< Partial< UserSettings > > {
	return await wpcom.req.post( '/me/settings', data );
}
