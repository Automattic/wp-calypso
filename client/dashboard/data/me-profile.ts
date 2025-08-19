import wpcom from 'calypso/lib/wp';

export interface UserProfile {
	avatar_URL: string;
	description: string;
	display_name: string;
	is_dev_account: boolean;
	tracks_opt_out: boolean;
	user_email: string;
	user_login: string;
	user_URL: string;
}

export async function fetchProfile(): Promise< UserProfile > {
	return await wpcom.req.get( '/me/settings' );
}

export async function updateProfile(
	data: Partial< UserProfile >
): Promise< Partial< UserProfile > > {
	const saveableKeys = [
		'display_name',
		'description',
		'is_dev_account',
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
