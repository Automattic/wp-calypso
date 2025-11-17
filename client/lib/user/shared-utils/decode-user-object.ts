import { decodeEntities } from 'calypso/lib/formatting/decode-entities';
import type { User } from '@automattic/api-core';

// Copied from packages/api-core/src/me/fetchers.ts.
export function decodeUserObject( user: User ): User {
	const decodedKeys = [ 'display_name', 'description', 'user_URL' ];
	const decodedUser = { ...user };

	for ( const key of Object.keys( decodedUser ) as Array< keyof User > ) {
		if ( ! decodedKeys.includes( key ) ) {
			continue;
		}

		const value = decodedUser[ key ];
		if ( typeof value === 'string' ) {
			decodedUser[ key ] = decodeEntities( value ) as never;
		}
	}

	return decodedUser;
}
