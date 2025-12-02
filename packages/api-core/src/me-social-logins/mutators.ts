import { localizeUrl } from '@automattic/i18n-utils';
import { wpcom } from '../wpcom-fetcher';
import type {
	ConnectSocialUserArgs,
	DisconnectSocialUserArgs,
	SocialUserConfigArgs,
	PostLoginRequestArgs,
	PostLoginRequestBodyObj,
} from './types';

export async function disconnectSocialUser(
	data: DisconnectSocialUserArgs & SocialUserConfigArgs
) {
	return wpcom.req.post( '/me/social-login/disconnect', data );
}

export async function connectSocialUser( data: ConnectSocialUserArgs & SocialUserConfigArgs ) {
	return wpcom.req.post( '/me/social-login/connect', data );
}

function stringifyBody( bodyObj: PostLoginRequestBodyObj ) {
	// Clone bodyObj, replacing null or undefined values with empty strings.
	const body = Object.fromEntries(
		Object.entries( bodyObj ?? {} ).map( ( [ key, val ] ) => [ key, val ?? '' ] )
	);
	return new globalThis.URLSearchParams( body ).toString();
}

export async function postLoginRequest( data: PostLoginRequestArgs ) {
	const { action, bodyObj } = data;
	const response = await window.fetch(
		localizeUrl( `https://wordpress.com/wp-login.php?action=${ action }` ),
		{
			method: 'POST',
			credentials: 'include',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: stringifyBody( bodyObj ),
		}
	);

	if ( response.ok ) {
		return { body: await response.json() };
	}
	throw new Error( await response.text() );
}
