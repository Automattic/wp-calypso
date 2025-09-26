import { wpcom } from '../wpcom-fetcher';
import type { UsernameValidationResult, UsernameChangeResult } from './types';

export async function validateUsername( username: string ): Promise< UsernameValidationResult > {
	return await wpcom.req.get( `/me/username/validate/${ username }` );
}

export async function updateUsername(
	username: string,
	action: string
): Promise< UsernameChangeResult > {
	return await wpcom.req.post( '/me/username', { username, action } );
}
