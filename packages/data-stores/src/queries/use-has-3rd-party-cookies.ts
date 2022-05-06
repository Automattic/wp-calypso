import { useEffect, useState } from 'react';

let result: boolean;

export function useHas3PC() {
	const [ hasCookies, setHasCookies ] = useState( Boolean( result ) );

	useEffect( () => {
		const iframe = document.createElement( 'iframe' );

		function handler( event: MessageEvent ) {
			const { data } = event;
			if ( data.type === 'widgets.wp.com-cookie-check' ) {
				setHasCookies( data.result );
				window.removeEventListener( 'message', handler );
				iframe.remove();
			}
		}
		if ( result === undefined ) {
			iframe.src = 'https://widgets.wp.com/calypso-happychat/check-cookies.html';
			iframe.style.display = 'none';

			window.addEventListener( 'message', handler );
			document.body.appendChild( iframe );
			() => {
				window.removeEventListener( 'message', handler );
			};
		}
	}, [] );

	return { hasCookies, isLoading: result === undefined };
}
