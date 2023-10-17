import config from '@automattic/calypso-config';
import { createAccountUrl } from 'calypso/lib/paths';

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
	const environment: string = config( 'env_id' );
	let domain: string = 'wordpress.com';
	let redirectTo: string = encodeURIComponent(
		`https://${ domain }/public.api/connect/?action=verify&service=wordpress`
	);
	if ( environment === 'development' ) {
		domain = 'wpcalypso.wordpress.com';
		redirectTo = encodeURIComponent(
			`https://${ domain }/public.api/connect/?action=verify&service=wordpress&domain=${ domain }`
		);
	}

	const loginURL: string = `https://wordpress.com/log-in?redirect_to=${ redirectTo }`;
	const createAccountURL: string = `https://wordpress.com${ createAccountUrl( {
		redirectTo: redirectTo,
		ref: 'reader-lw',
	} ) }`;
	const windowFeatures: string =
		'status=0,toolbar=0,location=1,menubar=0,directories=0,resizable=1,scrollbars=0,height=980,width=500';
	const windowName: string = 'CalypsoLogin';

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

		window.open( url, windowName, windowFeatures );

		// Listen for logged in confirmation from the login window.
		window.addEventListener( 'message', waitForLogin );
	};

	const login = () => {
		openWindow( loginURL );
	};

	const createAccount = () => {
		openWindow( createAccountURL );
	};

	return { login, createAccount };
}
