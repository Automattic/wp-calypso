import config from '@automattic/calypso-config';
import { createAccountUrl } from 'calypso/lib/paths';
import { addQueryArgs } from 'calypso/lib/url';

interface UseLoginWindowProps {
	onLoginSuccess: () => void;
}

interface UseLoginWindowReturn {
	login: () => void;
	createAccount: () => void;
}

export default function useLoginWindow( {
	onLoginSuccess,
}: UseLoginWindowProps ): UseLoginWindowReturn {
	const isBrowser: boolean = typeof window !== 'undefined';
	const environment = config( 'env_id' );
	let domain = 'wordpress.com';
	let redirectTo = addQueryArgs(
		{
			action: 'verify',
			service: 'wordpress',
		},
		`https://${ domain }/public.api/connect/`
	);

	// When in development, we need to redirect to a sandboxed domain to allow us to test changes to /public.api/connect/
	if ( environment === 'development' ) {
		domain = 'wpcalypso.wordpress.com';
		redirectTo = addQueryArgs(
			{
				action: 'verify',
				service: 'wordpress',
				domain: domain,
				origin: new URL( window.location.href )?.hostname,
			},
			`https://${ domain }/public.api/connect/`
		);
	}

	const loginURL = addQueryArgs( { redirect_to: redirectTo }, `https://wordpress.com/log-in` );
	const createAccountURL = `https://wordpress.com${ createAccountUrl( {
		redirectTo: redirectTo,
		ref: 'reader-lw',
	} ) }`;
	const windowFeatures =
		'status=0,toolbar=0,location=1,menubar=0,directories=0,resizable=1,scrollbars=0,height=980,width=500';
	const windowName = 'CalypsoLogin';

	const waitForLogin = ( event: MessageEvent ) => {
		if ( event.origin !== `https://${ domain }` ) {
			return;
		}

		if ( event?.data?.service === 'wordpress' ) {
			onLoginSuccess();
		}
	};

	const openWindow = ( url: string ) => {
		if ( ! isBrowser ) {
			return;
		}

		const loginWindow = window.open( url, windowName, windowFeatures );

		// Listen for logged in confirmation from the login window.
		window.addEventListener( 'message', waitForLogin );

		// Clean up loginWindow
		const loginWindowClosed = setInterval( () => {
			if ( loginWindow?.closed ) {
				removeEventListener( 'message', waitForLogin );
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

	return { login, createAccount };
}
