import { fetchGenerateAuthorizationNonce, type ConnectSocialUserArgs } from '@automattic/api-core';
import { postLoginRequestMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useAnalytics } from '../../app/analytics';
import { wpcomLink } from '../../utils/link';
import type { SocialLoginButtonProps } from './types';

// This component supports only Social Login from Google.
// It is used only in the Security page for now to connect and disconnect Google accounts.
// We can extend other flows in the future.
export default function GoogleLogin( {
	isConnected,
	responseHandler,
	handleDisconnect,
	isLoading,
}: SocialLoginButtonProps ) {
	const { recordTracksEvent } = useAnalytics();

	const { createErrorNotice } = useDispatch( noticesStore );

	const { mutate: postLoginRequest } = useMutation( postLoginRequestMutation() );

	const [ showLoading, setShowLoading ] = useState( false );

	const loadGoogleIdentityServicesAPI = async () => {
		const windowObj = window as unknown as Window & { google: { accounts: { oauth2: any } } };

		if ( ! windowObj?.google?.accounts?.oauth2 ) {
			try {
				await loadScript( 'https://accounts.google.com/gsi/client' );
			} catch {
				// It's safe to ignore loading errors because if Google is blocked in some way the the button will be disabled.
				setShowLoading( false );
				return null;
			}
		}

		return windowObj?.google?.accounts?.oauth2 ?? null;
	};

	interface AuthorizationCodeParams {
		auth_code: string;
		redirect_uri?: string;
		state: string;
	}

	const handleAuthorizationCode = async ( {
		auth_code,
		redirect_uri,
		state,
	}: AuthorizationCodeParams ) => {
		postLoginRequest(
			{
				action: 'exchange-social-auth-code',
				bodyObj: {
					service: 'google',
					auth_code,
					redirect_uri,
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
					state,
				},
			},
			{
				onSuccess: ( response ) => {
					const { access_token, id_token } = response.body.data as ConnectSocialUserArgs;
					responseHandler( { service: 'google', access_token, id_token } );
				},
				onError: () => {
					createErrorNotice(
						__( 'Something went wrong when trying to connect with Google. Please try again.' ),
						{
							type: 'snackbar',
						}
					);
				},
				onSettled: () => {
					setShowLoading( false );
				},
			}
		);
	};

	const handleClick = async ( e: React.MouseEvent< HTMLButtonElement > ) => {
		e.preventDefault();
		e.stopPropagation();
		setShowLoading( true );
		recordTracksEvent( 'calypso_dashboard_security_social_logins_google_login_click' );

		// Fetch nonce
		let nonce;
		try {
			nonce = await fetchGenerateAuthorizationNonce();
		} catch ( error ) {
			setShowLoading( false );
			createErrorNotice(
				__( 'Error fetching nonce or initializing Google sign-in. Please try again.' ),
				{
					type: 'snackbar',
				}
			);
			return;
		}

		// Load Google Identity Services API
		const googleSignIn = await loadGoogleIdentityServicesAPI();

		if ( ! googleSignIn ) {
			setShowLoading( false );
			createErrorNotice( __( 'Something went wrong while trying to load Google sign-in.' ), {
				type: 'snackbar',
			} );
			return;
		}

		// Initialize Google Sign-in
		const client = await googleSignIn.initCodeClient( {
			client_id: config( 'google_oauth_client_id' ),
			scope: 'openid profile email',
			ux_mode: 'popup',
			redirect_uri: wpcomLink( '/start/user' ),
			state: nonce,
			callback: async ( response: { error: string; code: string; state: string } ) => {
				if ( response.error ) {
					setShowLoading( false );
					return;
				}
				handleAuthorizationCode( { auth_code: response.code, state: response.state } );
			},
		} );
		client?.requestCode();
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
