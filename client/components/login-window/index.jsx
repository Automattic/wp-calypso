import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { getLogoutUrl } from 'calypso/lib/user/shared-utils';
import wpcom from 'calypso/lib/wp';

import './style.scss';

const addWordPressDomain = window.location.hostname.endsWith( '.wordpress.com' )
	? ' Domain=.wordpress.com'
	: '';

const getUserInfoCookie = () => {
	let userData = { service: 'guest' };
	const cookies = document.cookie.split( '; ' );

	for ( let i = 0; i < cookies.length; i++ ) {
		const cookie = cookies[ i ].trim();
		if ( cookie.startsWith( 'wpc_' ) ) {
			const service = cookie.slice( 0, 7 );
			const serviceName = service === 'wpc_wpc' ? 'wordpress' : 'guest';
			const data = cookie.slice( 8 );
			userData = data && {
				service: serviceName,
				...Object.fromEntries( new URLSearchParams( decodeURIComponent( data ) ) ),
			};

			if ( serviceName === 'wordpress' ) {
				const avatarUrl = new URL( userData.avatar );
				userData.avatar = avatarUrl.origin + avatarUrl.pathname + '?s=64';
				//TODO: add break here?
			}
		}
	}
	return userData;
};

const setUserInfoCookie = ( userData ) => {
	let cookieName;
	const { service } = userData;

	if ( service === 'wordpress' ) {
		cookieName = 'wpc_wpc';
	}

	const cookieData = new URLSearchParams( {
		...userData,
		avatar: encodeURIComponent( userData.avatar ),
		email: encodeURIComponent( userData.email ),
		logout_url: encodeURIComponent( userData.logout_url ),
		uid: userData.uid.toString(),
	} ).toString();

	document.cookie = `${ cookieName }=${ cookieData }; path=/; SameSite=None; Secure=True;${ addWordPressDomain }`;
};

export default function useLoginWindow() {
	const [ userInfo, setUserInfo ] = useState();
	const [ loginWindowRef, setLoginWindowRef ] = useState();
	const WordPressIcon = () => {
		return (
			<svg
				width="20"
				height="20"
				viewBox="0 0 20 20"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M19.2308 9.99981C19.2308 4.91366 15.0862 0.769043 10.0001 0.769043C4.90467 0.769043 0.769287 4.91366 0.769287 9.99981C0.769287 15.0952 4.90467 19.2306 10.0001 19.2306C15.0862 19.2306 19.2308 15.0952 19.2308 9.99981ZM7.95083 14.9567L4.80313 6.51058C5.31083 6.49212 5.88313 6.43674 5.88313 6.43674C6.34467 6.38135 6.28929 5.39366 5.82775 5.41212C5.82775 5.41212 4.48929 5.51366 3.64006 5.51366C3.4739 5.51366 3.29852 5.51366 3.10467 5.50443C4.57236 3.25212 7.11083 1.79366 10.0001 1.79366C12.1508 1.79366 14.1077 2.59674 15.5847 3.95366C14.957 3.85212 14.0616 4.31366 14.0616 5.41212C14.0616 6.01026 14.3801 6.52347 14.7382 7.10048C14.7891 7.18242 14.8407 7.26565 14.8924 7.35058C15.2154 7.91366 15.4001 8.60597 15.4001 9.62135C15.4001 10.9967 14.1077 14.2367 14.1077 14.2367L11.3108 6.51058C11.8093 6.49212 12.0677 6.35366 12.0677 6.35366C12.5293 6.3075 12.4739 5.19981 12.0124 5.2275C12.0124 5.2275 10.6831 5.33827 9.81544 5.33827C9.01236 5.33827 7.66467 5.2275 7.66467 5.2275C7.20313 5.19981 7.14775 6.3352 7.60929 6.35366L8.45852 6.4275L9.62159 9.5752L7.95083 14.9567ZM16.8602 9.94619L16.8401 9.99981C16.1713 11.7605 15.5075 13.5364 14.8451 15.3087L14.845 15.309L14.8448 15.3093C14.6113 15.9341 14.378 16.5583 14.1447 17.1814C16.6093 15.7598 18.2062 13.0367 18.2062 9.99981C18.2062 8.57827 17.8831 7.2675 17.237 6.07674C17.5147 8.20894 17.0881 9.34123 16.8602 9.94617L16.8602 9.94619ZM6.40006 17.4675C3.64929 16.1383 1.7939 13.2583 1.7939 9.99981C1.7939 8.79981 2.00621 7.71058 2.45852 6.68597L3.28801 8.95912C4.32263 11.7949 5.35847 14.6341 6.40006 17.4675ZM12.5016 17.7906L10.1201 11.3475C9.68129 12.6419 9.23927 13.9362 8.79593 15.2344C8.4931 16.1212 8.18965 17.0097 7.88621 17.9014C8.55083 18.1044 9.27083 18.206 10.0001 18.206C10.877 18.206 11.7077 18.0583 12.5016 17.7906Z"
					fill="white"
				/>
			</svg>
		);
	};

	const serviceData = {
		wordpress: {
			cookieName: 'wpc_wpc',
			name: 'WordPress.com',
			popup: ',height=980,width=500',
			icon: WordPressIcon,
			class: 'wordpress-login',
		},
	};

	useEffect( () => {
		setUserInfo( getUserInfoCookie() );
	}, [] );

	const logout = () => {
		const logoutURL = getLogoutUrl( userInfo );
		const serviceName = userInfo?.service;
		const cookieName = serviceData[ serviceName ].cookieName;

		const cookie = `${ cookieName }=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure=True;${ addWordPressDomain }`;
		document.cookie = cookie;

		if ( serviceName === 'wordpress' ) {
			// Atomic logging out
			if ( window.location.host === 'jetpack.wordpress.com' ) {
				const newURL =
					logoutURL + '&redirect_to=' + window.location.hash.match( /#parent=(.*)/ )[ 1 ];
				window.parent.location.href = newURL;
			} else {
				window.location.href = logoutURL + '&redirect_to=' + window.location.href;
			}
		}
	};

	const { res } = useQuery( {
		queryKey: [ 'verbum/auth' ],
		queryFn: () =>
			wpcom.req.get( {
				path: `/verbum/auth`,
				apiNamespace: 'wpcom/v2',
			} ),
		select: ( data ) => {
			//console.log( data );
			return data;
		},
	} );
	//console.log( 'res: ', res );
	setUserInfo( res );

	const login = async ( service ) => {
		const { connectURL } = 'https://wordpress.com/log-in';

		const loginWindow = window.open(
			`${ connectURL }&service=${ service }`,
			'VerbumCommentsLogin',
			`status=0,toolbar=0,location=1,menubar=0,directories=0,resizable=1,scrollbars=0${ serviceData[ service ].popup }`
		);

		// Listen for login data
		window.addEventListener( 'message', function waitForLogin( event ) {
			if ( event.origin !== document.location.origin ) {
				return;
			}

			if ( event.data.service === service ) {
				setUserInfo( event.data );

				if ( ! document.cookie.includes( 'wpc_' ) ) {
					setUserInfoCookie( event.data );
				}
				window.removeEventListener( 'message', waitForLogin );
			}
		} );

		// Clean up loginWindow to reset activeService
		const loginClosed = setInterval( () => {
			if ( loginWindow?.closed ) {
				clearInterval( loginClosed );
				setLoginWindowRef( undefined );
			}
		}, 100 );

		setLoginWindowRef( loginWindow );
	};

	return { userInfo, login, loginWindowRef, logout };
}
