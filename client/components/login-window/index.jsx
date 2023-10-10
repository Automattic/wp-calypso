import { useEffect } from 'react';

export default function useLoginWindow( { onLoginSuccess } ) {
	const isBrowser = typeof window !== 'undefined';

	const waitForLogin = ( event ) => {
		if ( event.origin !== 'wordpress.com' ) {
			return;
		}

		if ( event?.data?.service === 'wordpress' ) {
			onLoginSuccess();
			if ( isBrowser ) {
				window.removeEventListener( 'message', waitForLogin );
			}
		}
	};

	const login = () => {
		if ( ! isBrowser ) {
			return;
		}

		const loginWindow = window.open(
			`https://wordpress.com/public.api/connect/?action=request&service=wordpress`,
			'CalyspoLogin',
			'status=0,toolbar=0,location=1,menubar=0,directories=0,resizable=1,scrollbars=0,height=980,width=500'
		);

		// Listen for login data
		window.addEventListener( 'message', waitForLogin );

		// Clean up loginWindow
		const loginClosed = setInterval( () => {
			if ( loginWindow?.closed ) {
				clearInterval( loginClosed );
			}
		}, 100 );
	};

	const createAccount = () => {
		if ( ! isBrowser ) {
			return;
		}

		const createAccountWindow = window.open(
			`https://wordpress.com/start/account/user?redirect_to=https%3A%2F%2Fwordpress.com%2Fpublic.api%2Fconnect%2F%3Faction%3Dverify%26service%3Dwordpress`,
			'CalyspoLogin',
			'status=0,toolbar=0,location=1,menubar=0,directories=0,resizable=1,scrollbars=0,height=980,width=500'
		);

		// Listen for login data
		window.addEventListener( 'message', waitForLogin );

		// Clean up loginWindow
		const createAccountWindowClosed = setInterval( () => {
			if ( createAccountWindow?.closed ) {
				clearInterval( createAccountWindowClosed );
			}
		}, 100 );
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
