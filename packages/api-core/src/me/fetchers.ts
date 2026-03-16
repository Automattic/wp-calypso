import { wpcom } from '../wpcom-fetcher';
import type { User, TwoStep } from './types';

async function decode( text: string ) {
	const { decode } = await import( 'he' );
	return decode( text );
}

async function decodeEntities( text: string ) {
	// Bypass decode if text doesn't include entities
	if ( 'string' !== typeof text || -1 === text.indexOf( '&' ) ) {
		return text;
	}
	return decode( text );
}

async function decodeUserObject( user: User ): Promise< User > {
	const decodedKeys = [ 'display_name', 'description', 'user_URL' ];
	const decodedUser = { ...user };

	for ( const key of Object.keys( decodedUser ) as Array< keyof User > ) {
		if ( ! decodedKeys.includes( key ) ) {
			continue;
		}

		const value = decodedUser[ key ];
		if ( typeof value === 'string' ) {
			decodedUser[ key ] = ( await decodeEntities( value ) ) as never;
		}
	}

	return decodedUser;
}

export async function fetchUser(): Promise< User > {
	const user = await wpcom.req.get( '/me', { meta: 'flags' } );
	return decodeUserObject( user );
}

export async function fetchTwoStep(): Promise< TwoStep > {
	return wpcom.req.get( '/me/two-step' );
}
