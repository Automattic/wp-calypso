import { disconnectSocialUser, connectSocialUser, postLoginRequest } from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { ConnectSocialUserArgs, PostLoginRequestArgs } from '@automattic/api-core';

export const disconnectSocialUserMutation = () =>
	mutationOptions( {
		mutationFn: ( service: string ) =>
			disconnectSocialUser( {
				service,
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
			} ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'auth', 'user' ] } );
		},
	} );

export const connectSocialUserMutation = () =>
	mutationOptions( {
		mutationFn: ( data: ConnectSocialUserArgs ) =>
			connectSocialUser( {
				...data,
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
			} ),
		onSuccess: () => {
			queryClient.invalidateQueries( { queryKey: [ 'auth', 'user' ] } );
		},
	} );

export const postLoginRequestMutation = () =>
	mutationOptions( {
		mutationFn: ( data: PostLoginRequestArgs ) => postLoginRequest( data ),
	} );
