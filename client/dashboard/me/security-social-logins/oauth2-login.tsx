import { postLoginRequestMutation } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { getQueryArg } from '@wordpress/url';
import { MouseEvent, useCallback, useEffect, useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import type { SocialLoginButtonProps } from './types';
import type { ConnectSocialUserArgs } from '@automattic/api-core';

export type OAuth2LoginProps = SocialLoginButtonProps & {
	service: 'github' | 'paypal';
	label: string;
	onClick?: ( event: MouseEvent< HTMLButtonElement >, redirectUri: string ) => void;
};

// This component supports typical OAuth2 Social Login.
// It is used only in the Security page for now to connect and disconnect OAuth2 accounts.
// This common component was extracted from ./github-login.tsx, so check that file's history if you need to.
export default function OAuth2Login( {
	service,
	label,
	isConnected,
	responseHandler,
	redirectUri,
	handleDisconnect,
	isLoading,
	onClick,
}: OAuth2LoginProps ) {
	const { recordTracksEvent } = useAnalytics();

	const { createErrorNotice } = useDispatch( noticesStore );

	const { mutate: postLoginRequest } = useMutation( postLoginRequestMutation() );

	const code = ( getQueryArg( window.location.search, 'code' ) || '' ) as string;
	const requestService = ( getQueryArg( window.location.search, 'service' ) || '' ) as string;
	const error = ( getQueryArg( window.location.search, 'error' ) || '' ) as string;

	const [ showLoading, setShowLoading ] = useState< boolean >( false );

	const handleError = useCallback( () => {
		createErrorNotice(
			sprintf(
				// Translators: %(service)s is the name of a third-party authentication provider, e.g. "Google", "Facebook", "Apple" ...
				__( 'Something went wrong when trying to connect with %(service)s. Please try again.' ),
				{
					service: label,
				}
			),
			{
				type: 'snackbar',
			}
		);
	}, [ createErrorNotice, label ] );

	const exchangeCodeForToken = useCallback(
		async ( auth_code: string ) => {
			postLoginRequest(
				{
					action: 'exchange-social-auth-code',
					bodyObj: {
						service,
						auth_code,
						client_id: config( 'wpcom_signup_id' ),
						client_secret: config( 'wpcom_signup_key' ),
					},
				},
				{
					onSuccess: ( response ) => {
						const { access_token } = response?.body?.data as ConnectSocialUserArgs;
						responseHandler( { access_token, service } );
					},
					onError: () => {
						handleError();
					},
					onSettled: () => {
						setShowLoading( false );
					},
				}
			);
		},
		[ handleError, responseHandler, service, postLoginRequest ]
	);

	useEffect( () => {
		if ( code && requestService === service && ! isConnected ) {
			setShowLoading( true );
			exchangeCodeForToken( code );
		}
	}, [ code, requestService, service, isConnected, exchangeCodeForToken ] );

	useEffect( () => {
		if ( requestService === service && error ) {
			handleError();
		}
	}, [ error, requestService, service, handleError ] );

	const stripQueryString = ( url: string ) => {
		const urlParts = url.split( '?' );
		return urlParts[ 0 ];
	};

	const handleClick = ( e: MouseEvent< HTMLButtonElement > ) => {
		e.preventDefault();
		setShowLoading( true );
		recordTracksEvent( 'calypso_dashboard_security_social_logins_' + service + '_login_click' );

		onClick?.( e, stripQueryString( redirectUri ?? '' ) );
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
