import {
	disconnectSocialUser,
	connectSocialUser,
	fetchUser,
	postLoginRequest,
} from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { ConnectSocialUserArgs, PostLoginRequestArgs, User } from '@automattic/api-core';

let latestUserRefresh = 0;

// Invalidating the auth user isn't enough: when the dashboard bootstraps the user
// its query returns the page-load `window.currentUser` again, so fetch `/me`
// directly. It's merged over the cached user to keep bootstrap-only fields.
async function refreshCurrentUser() {
	const refresh = ++latestUserRefresh;
	try {
		const freshUser = await fetchUser();
		// A refresh started after a later change must not be overwritten by this one.
		if ( refresh !== latestUserRefresh ) {
			return;
		}
		queryClient.setQueryData< User >( [ 'auth', 'user' ], ( user ) =>
			user ? { ...user, ...freshUser } : user
		);
	} catch {
		// The change itself succeeded; the page will catch up on the next load.
	}
}

// Not awaited, so a slow `/me` doesn't hold the mutation open.
const onSocialUserChanged = () => {
	refreshCurrentUser();
};

export const disconnectSocialUserMutation = () =>
	mutationOptions( {
		meta: { statId: 'social-user-disconnect' },
		mutationFn: ( service: string ) =>
			disconnectSocialUser( {
				service,
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
			} ),
		onSuccess: onSocialUserChanged,
	} );

export const connectSocialUserMutation = () =>
	mutationOptions( {
		meta: { statId: 'social-user-connect' },
		mutationFn: ( data: ConnectSocialUserArgs ) =>
			connectSocialUser( {
				...data,
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
			} ),
		onSuccess: onSocialUserChanged,
	} );

export const postLoginRequestMutation = () =>
	mutationOptions( {
		meta: { statId: 'login-request-post' },
		mutationFn: ( data: PostLoginRequestArgs ) => postLoginRequest( data ),
	} );
