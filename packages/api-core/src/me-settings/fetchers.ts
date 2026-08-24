import { wpcom } from '../wpcom-fetcher';
import { adaptUserSettings } from './adapters';
import type { UserSettings } from './types';

export async function fetchUserSettings(): Promise< UserSettings > {
	return adaptUserSettings( await wpcom.req.get( '/me/settings' ) );
}
