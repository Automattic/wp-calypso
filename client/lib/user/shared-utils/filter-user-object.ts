import { type UserData } from '../user';
import { getComputedAttributes } from './get-computed-attributes';

const requiredKeys = [ 'ID' ];

export function filterUserObject( user: UserData ): UserData {
	if ( typeof user !== 'object' ) {
		throw new Error( 'the /me response is not an object' );
	}

	for ( const key of requiredKeys ) {
		if ( ! user.hasOwnProperty( key ) ) {
			throw new Error( `the /me response misses a required field '${ key }'` );
		}
	}

	return Object.assign( user, getComputedAttributes( user ) );
}
