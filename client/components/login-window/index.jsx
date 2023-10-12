import config from '@automattic/calypso-config';
import { useEffect } from 'react';
import { createAccountUrl } from 'calypso/lib/paths';

export default function useLoginWindow( { onLoginSuccess } ) {
	const isBrowser = typeof window !== 'undefined';
	const environment = config( 'env_id' );
	let domain = 'wordpress.com';
	let redirectTo = encodeURIComponent(
		`https://${ domain }/public.api/connect/?action=verify&service=wordpress`
	);
	if ( environment === 'development' ) {
		// We need to redirect to a sandboxed domain in development to allow us to test the postMessage returned from public_api_connect_close_window()
		domain = 'wpcalypso.wordpress.com';
		redirectTo = encodeURIComponent(
			`https://${ domain }/public.api/connect/?action=verify&service=wordpress&domain=${ domain }`
		);
	}

	const loginURL = `https://wordpress.com/log-in?redirect_to=${ redirectTo }`;
	const createAccountURL = `https://wordpress.com${ createAccountUrl( {
		redirectTo: redirectTo,
		ref: 'reader-lw',
	} ) }`;
	const windowFeatures =
		'status=0,toolbar=0,location=1,menubar=0,directories=0,resizable=1,scrollbars=0,height=980,width=500';
	const windowName = 'CalypsoLogin';

	const waitForLogin = ( event ) => {
		if ( event.origin !== `https://${ domain }` ) {
			return;
		}

		if ( event?.data?.service === 'wordpress' ) {
			onLoginSuccess();
			if ( isBrowser ) {
				window.removeEventListener( 'message', waitForLogin );
			}
		}
	};

	const openWindow = ( url ) => {
		if ( ! isBrowser ) {
			return;
		}

		const loginWindow = window.open( url, windowName, windowFeatures );

		// Listen for login data
		window.addEventListener( 'message', waitForLogin );

		// Clean up loginWindow
		const loginWindowClosed = setInterval( () => {
			if ( loginWindow?.closed ) {
				clearInterval( loginWindowClosed );
			}
		}, 100 );
	};

	const login = () => {
		openWindow( loginURL );
	};

	const createAccount = () => {
		openWindow( createAccountURL );
	};

	//Cleanup event listener when component unmounts
	useEffect( () => {
		return () => {
			if ( isBrowser ) {
				window.removeEventListener( 'message', waitForLogin );
			}
		};
	}, [] );

	return { login, createAccount };
}
