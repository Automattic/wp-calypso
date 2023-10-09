import { useState, useEffect } from 'react';

export default function useLoginWindow( { onLoginSuccess, domain } ) {
	const isBrowser = typeof window !== 'undefined';
	const [ loginWindowRef, setLoginWindowRef ] = useState();
	const baseURL = `https://${ domain }`;

	const waitForLogin = ( event ) => {
		if ( event.origin !== baseURL ) {
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
			`${ baseURL }/public.api/connect/?action=request&domain=${ domain }&service=wordpress`,
			'CalyspoLogin',
			'status=0,toolbar=0,location=1,menubar=0,directories=0,resizable=1,scrollbars=0,height=980,width=500'
		);

		// Listen for login data
		window.addEventListener( 'message', waitForLogin );

		// Clean up loginWindow
		const loginClosed = setInterval( () => {
			if ( loginWindow?.closed ) {
				clearInterval( loginClosed );
				setLoginWindowRef( undefined );
			}
		}, 100 );

		setLoginWindowRef( loginWindow );
	};

	//Cleanup event listener when component unmounts
	useEffect( () => {
		return () => {
			if ( isBrowser ) {
				window.removeEventListener( 'message', waitForLogin );
			}
		};
	}, [] );

	return { login, loginWindowRef };
}
