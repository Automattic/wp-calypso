import { wpcom } from '../wpcom-fetcher';
import type { UserProfile } from './types';

export async function fetchProfile(): Promise< UserProfile > {
	return await wpcom.req.get( '/me/settings' );
}
