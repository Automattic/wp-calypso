import { useEffect, useState } from 'react';

/**
 * Checks if third-party cookies are enabled by attempting to set and read a test cookie
 */
export function useThirdPartyCookies(): boolean {
	const [ areThirdPartyCookiesEnabled, setAreThirdPartyCookiesEnabled ] =
		useState< boolean >( true );

	useEffect( () => {
		const checkThirdPartyCookies = () => {
			try {
				// Try to set a test cookie
				document.cookie = 'cookietest=1; SameSite=None; Secure;';
				const result = document.cookie.indexOf( 'cookietest=' ) !== -1;
				// Clean up
				document.cookie =
					'cookietest=1; SameSite=None; Secure; expires=Thu, 01-Jan-1970 00:00:01 GMT';
				setAreThirdPartyCookiesEnabled( result );
			} catch ( e ) {
				setAreThirdPartyCookiesEnabled( false );
			}
		};

		checkThirdPartyCookies();
	}, [] );

	return areThirdPartyCookiesEnabled;
}
