import { postLoginRequestMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { getQueryArg, addQueryArgs } from '@wordpress/url';
import { MouseEvent, useCallback, useEffect, useState } from 'react';
import type { SocialLoginButtonProps } from './types';
import type { ConnectSocialUserArgs } from '@automattic/api-core';

// This component supports only Social Login from GitHub.
// It is used only in the Security page for now to connect and disconnect GitHub accounts.
// We can extend other flows in the future.
export default function GitHubLogin( {
	isConnected,
	responseHandler,
	redirectUri,
	handleDisconnect,
	isLoading,
}: SocialLoginButtonProps ) {
	const { createErrorNotice } = useDispatch( noticesStore );

	const { mutate: postLoginRequest } = useMutation( postLoginRequestMutation() );

	const code = ( getQueryArg( window.location.search, 'code' ) || '' ) as string;
	const service = ( getQueryArg( window.location.search, 'service' ) || '' ) as string;
	const error = ( getQueryArg( window.location.search, 'error' ) || '' ) as string;

	const [ showLoading, setShowLoading ] = useState< boolean >( false );

	const handleGitHubError = useCallback( () => {
		createErrorNotice(
			__( 'Something went wrong when trying to connect with GitHub. Please try again.' ),
			{
				type: 'snackbar',
			}
		);
	}, [ createErrorNotice ] );

	const exchangeCodeForToken = useCallback(
		async ( auth_code: string ) => {
			postLoginRequest(
				{
					action: 'exchange-social-auth-code',
					bodyObj: {
						service: 'github',
						auth_code,
						client_id: config( 'wpcom_signup_id' ),
						client_secret: config( 'wpcom_signup_key' ),
					},
				},
				{
					onSuccess: ( response ) => {
						const { access_token } = response?.body?.data as ConnectSocialUserArgs;
						responseHandler( { access_token, service: 'github' } );
					},
					onError: () => {
						handleGitHubError();
					},
					onSettled: () => {
						setShowLoading( false );
					},
				}
			);
		},
		[ handleGitHubError, responseHandler, postLoginRequest ]
	);

	const stripQueryString = ( url: string ) => {
		const urlParts = url.split( '?' );
		return urlParts[ 0 ];
	};

	useEffect( () => {
		if ( code && service === 'github' && ! isConnected ) {
			setShowLoading( true );
			exchangeCodeForToken( code );
		}
	}, [ code, service, isConnected, exchangeCodeForToken ] );

	useEffect( () => {
		if ( service === 'github' && error ) {
			handleGitHubError();
		}
	}, [ error, service, handleGitHubError ] );

	const handleClick = ( e: MouseEvent< HTMLButtonElement > ) => {
		e.preventDefault();
		setShowLoading( true );

		window.location.href = addQueryArgs(
			'https://public-api.wordpress.com/wpcom/v2/hosting/github/app-authorize',
			{
				redirect_uri: stripQueryString( redirectUri ?? '' ),
				scope: encodeURIComponent( 'read:user,user:email' ),
				ux_mode: 'redirect',
			}
		);
	};

	return (
		<Button
			onClick={ isConnected ? handleDisconnect : handleClick }
			variant={ isConnected ? 'secondary' : 'primary' }
			size="compact"
			isBusy={ isLoading || showLoading }
			disabled={ isLoading || showLoading }
		>
			{ isConnected ? __( 'Disconnect' ) : __( 'Connect' ) }
		</Button>
	);
}
