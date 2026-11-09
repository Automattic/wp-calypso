import { postWpLoginAction } from '../wp-login';
import { wpcom } from '../wpcom-fetcher';
import type {
	ConnectSocialUserArgs,
	DisconnectSocialUserArgs,
	SocialUserConfigArgs,
	PostLoginRequestArgs,
} from './types';

export async function disconnectSocialUser(
	data: DisconnectSocialUserArgs & SocialUserConfigArgs
) {
	return wpcom.req.post( '/me/social-login/disconnect', data );
}

export async function connectSocialUser( data: ConnectSocialUserArgs & SocialUserConfigArgs ) {
	return wpcom.req.post( '/me/social-login/connect', data );
}

export async function postLoginRequest( data: PostLoginRequestArgs ) {
	const { action, bodyObj } = data;
	return { body: await postWpLoginAction< unknown >( action, bodyObj ) };
}
