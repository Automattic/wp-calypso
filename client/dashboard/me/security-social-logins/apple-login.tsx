import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { MouseEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { getRedirectUri, getSocialServiceResponse } from './utils';
import type { SocialLoginButtonProps, AppleClient } from './types';

const APPLE_CLIENT_URL =
	'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

// This component supports only Social Login from Apple.
// It is used only in the Security page for now to connect and disconnect Apple accounts.
// We can extend other flows in the future.
export default function AppleLogin( {
	isConnected,
	responseHandler,
	handleDisconnect,
	isLoading,
}: SocialLoginButtonProps ) {
	const [ appleClient, setAppleClient ] = useState< AppleClient | null >( null );
	const [ showLoading, setShowLoading ] = useState( false );

	const socialServiceResponse = useMemo( () => getSocialServiceResponse(), [] );

	const loadAppleClient = useCallback( async () => {
		if ( appleClient ) {
			return appleClient;
		}

		const windowObj = window as unknown as Window & {
			AppleID: AppleClient;
		};

		if ( ! windowObj.AppleID ) {
			await loadScript( APPLE_CLIENT_URL );
		}

		const oauth2State = String( Math.floor( Math.random() * 10e9 ) );
		windowObj.sessionStorage.setItem( 'siwa_state', oauth2State );

		windowObj.AppleID.auth.init( {
			clientId: config( 'apple_oauth_client_id' ),
			scope: 'name email',
			redirectURI: getRedirectUri(),
			state: JSON.stringify( {
				oauth2State,
				originalUrlPath: window?.location?.pathname,
			} ),
		} );

		setAppleClient( windowObj.AppleID );
		return windowObj.AppleID;
	}, [ appleClient ] );

	const handleSocialResponseFromRedirect = useCallback( () => {
		if ( ! socialServiceResponse ) {
			return;
		}

		const { client_id, state, user_email, user_name, id_token } = socialServiceResponse;
		if ( client_id !== config( 'apple_oauth_client_id' ) ) {
			return;
		}

		const storedOauth2State = window.sessionStorage.getItem( 'siwa_state' );
		window.sessionStorage.removeItem( 'siwa_state' );

		if ( state !== storedOauth2State ) {
			return;
		}

		responseHandler( {
			service: 'apple',
			id_token: id_token,
			user_name: user_name,
			user_email: user_email,
		} );
	}, [ responseHandler, socialServiceResponse ] );

	useEffect( () => {
		if ( socialServiceResponse ) {
			handleSocialResponseFromRedirect();
		}
		loadAppleClient();
	}, [ handleSocialResponseFromRedirect, loadAppleClient, socialServiceResponse ] );

	const handleClick = ( e: MouseEvent< HTMLButtonElement > ) => {
		e.preventDefault();
		setShowLoading( true );
		loadAppleClient().then( ( AppleID ) => AppleID.auth.signIn() );
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
