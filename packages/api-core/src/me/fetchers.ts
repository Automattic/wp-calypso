import { decode } from 'he';
import { wpcom } from '../wpcom-fetcher';
import type { User, TwoStep } from './types';

const decodedKeys = [ 'display_name', 'description', 'user_URL' ];

function decodeEntities( text: string ) {
	// Bypass decode if text doesn't include entities
	if ( 'string' !== typeof text || -1 === text.indexOf( '&' ) ) {
		return text;
	}

	return decode( text );
}

export async function fetchUser(): Promise< User > {
	const user = await wpcom.req.get( '/me', { meta: 'flags' } );
	for ( const key in user ) {
		if ( ! decodedKeys.includes( key ) ) {
			continue;
		}

		const value = user[ key ];
		user[ key ] = value ? decodeEntities( value as string ) : value;
	}

	return user;
}

export async function fetchTwoStep(): Promise< TwoStep > {
	return wpcom.req.get( '/me/two-step' );
}
