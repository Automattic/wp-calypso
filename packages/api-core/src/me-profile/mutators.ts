import { wpcom } from '../wpcom-fetcher';
import type { UserProfile } from './types';

export async function updateProfile(
	data: Partial< UserProfile >
): Promise< Partial< UserProfile > > {
	const saveableKeys = [
		'advertising_targeting_opt_out',
		'display_name',
		'description',
		'is_dev_account',
		'password',
		'tracks_opt_out',
		'user_URL',
	];

	for ( const key in data ) {
		if ( ! saveableKeys.includes( key ) ) {
			delete data[ key as keyof UserProfile ];
		}
	}
	return await wpcom.req.post( '/me/settings', data );
}
