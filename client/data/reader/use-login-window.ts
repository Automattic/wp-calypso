import config from '@automattic/calypso-config';
import { useState } from 'react';
import { addQueryArgs } from 'calypso/lib/url';

interface UseLoginWindowProps {
	onLoginSuccess: () => void;
	onWindowClose: () => void;
}

interface UseLoginWindowReturn {
	login: () => void;
	createAccount: () => void;
	close: () => void;
}

export default function useLoginWindow( {
	onLoginSuccess,
	onWindowClose,
}: UseLoginWindowProps ): UseLoginWindowReturn {
	const [ loginWindow, setLoginWindow ] = useState< Window | null >( null );
	const isBrowser: boolean = typeof window !== 'undefined';

	if ( ! isBrowser ) {
		return {
			login: () => {},
			createAccount: () => {},
			close: () => {},
		};
	}

	const environment = config( 'env_id' );
	const args = {
		action: 'verify',
		service: 'wordpress',
		// When in development, we need to pass an origin to allow the postMessage to know where to send the message.
		origin: environment === 'development' ? new URL( window.location.href )?.hostname : undefined,
	};

	const redirectTo = addQueryArgs( args, 'https://wordpress.com/public.api/connect/' );
	const loginURL = addQueryArgs( { redirect_to: redirectTo }, 'https://wordpress.com/log-in' );
	const createAccountURL = addQueryArgs(
		{
			redirect_to: redirectTo,
			ref: 'reader-lp',
		},
		'https://wordpress.com/start/account'
	);
	const windowFeatures =
		'status=0,toolbar=0,location=1,menubar=0,directories=0,resizable=1,scrollbars=0,height=980,width=500';
	const windowName = 'CalypsoLogin';

	const waitForLogin = ( event: MessageEvent ) => {
		if ( 'https://wordpress.com' !== event?.origin ) {
			return;
		}

		if ( event?.data?.service === 'wordpress' ) {
			onLoginSuccess();
		}
	};

	const openWindow = ( url: string ) => {
		const popupWindow = window.open( url, windowName, windowFeatures );

		// Listen for logged in confirmation from the login window.
		window.addEventListener( 'message', waitForLogin );

		// Clean up loginWindow
		const loginWindowClosed = setInterval( () => {
			if ( popupWindow?.closed ) {
				onWindowClose();
				removeEventListener( 'message', waitForLogin );
				clearInterval( loginWindowClosed );
			}
		}, 100 );

		setLoginWindow( popupWindow );
	};

	const login = () => {
		openWindow( loginURL );
	};

	const createAccount = () => {
		openWindow( createAccountURL );
	};

	const close = () => {
		loginWindow?.close();
	};

	return { login, createAccount, close };
}
