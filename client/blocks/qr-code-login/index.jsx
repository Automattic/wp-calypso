import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import QRCode from 'qrcode.react';
import { useEffect, useState, useRef } from 'react';
import qrCenter from 'calypso/assets/images/qr-login/wp.png';

import './style.scss';

const AUTH_PULL_INTERVAL = 5000; // 5 seconds
const LOCALE_STORAGE_KEY = 'qr-login-token';

const isStillValidToken = ( tokenData ) => {
	if ( ! tokenData?.expires ) {
		return false;
	}
	return expires > Date.now() / 1000;
};

const setLocalTokenData = ( data ) => {
	try {
		window.localStorage.setItem( LOCALE_STORAGE_KEY, JSON.stringify( data ) );
	} catch ( e ) {}
};

const getLocalTokenData = () => {
	try {
		const valueString = window.localStorage.getItem( LOCALE_STORAGE_KEY );
		if ( valueString === undefined || valueString === null ) {
			return false;
		}

		const tokenData = JSON.parse( valueString );
		if ( isStillValidToken( tokenData ) ) {
			return tokenData;
		}
	} catch ( e ) {}

	return false;
};

const getLoginActionResponse = async ( action, args ) => {
	const url = new URL( 'https://wordpress.com/wp-login.php' );
	url.searchParams.append( 'action', action );

	Object.keys( args ).forEach( ( key ) => {
		url.searchParams.append( key, args[ key ] );
	} );

	const response = await fetch( url.href );
	return await response.json();
};

const fetchQRCodeData = async ( setTokenData, tokenData, anonymousUserId ) => {
	if ( isStillValidToken( tokenData ) ) {
		return tokenData;
	}

	const responseData = await getLoginActionResponse( 'qr-code-token-request-endpoint', {
		anon_id: anonymousUserId,
	} );

	setTokenData( responseData.data );
	setLocalTokenData( responseData.data );
};

const fetchAuthState = async ( setAuthState, setTokenData, tokenData, anonymousUserId ) => {
	if ( ! tokenData ) {
		return;
	}

	if ( ! isStillValidToken( tokenData ) ) {
		fetchQRCodeData( setTokenData, tokenData, anonymousUserId );
		return;
	}

	const { token, encrypted } = tokenData;

	const responseData = await getLoginActionResponse( 'qr-code-authentication-endpoint', {
		anon_id: anonymousUserId,
		token: token,
		data: encrypted,
	} );

	setAuthState( responseData.data );
};

function TokenQRCode( { tokenData } ) {
	if ( ! tokenData ) {
		return <QRCodePlaceholder />;
	}
	const { token, encrypted } = tokenData;
	const imageSettings = {
		src: qrCenter,
		height: 64,
		width: 64,
		excavate: false,
	};
	return (
		<QRCode
			value={ `https://apps.wordpress.com/get/?campaign=login-qr-code#qr-code-login?token=${ token }&data=${ encrypted }` }
			size={ 352 }
			imageSettings={ imageSettings }
		/>
	);
}

function QRCodePlaceholder() {
	return (
		<div className="qr-code-login__placeholder">
			<span className="qr-code-login__corner-box"></span>
			<span className="qr-code-login__corner-box"></span>
			<span className="qr-code-login__corner-box"></span>
		</div>
	);
}

function QRCodeLogin() {
	const translate = useTranslate();
	const [ tokenData, setTokenData ] = useState( () => getLocalTokenData() );
	const [ authState, setAuthState ] = useState( false );
	const currentTimer = useRef( null );

	const anonymousUserId = getTracksAnonymousUserId();

	// Fetch QR code data.
	useEffect( () => {
		fetchQRCodeData( setTokenData, tokenData, anonymousUserId );
	}, [ setTokenData, tokenData, anonymousUserId ] );

	// Fetch the Auth Data.
	useEffect( () => {
		clearInterval( currentTimer.current );
		currentTimer.current = setInterval( () => {
			fetchAuthState( setAuthState, setTokenData, tokenData, anonymousUserId );
		}, AUTH_PULL_INTERVAL );

		return () => clearInterval( currentTimer.current );
	}, [ setAuthState, setTokenData, tokenData, anonymousUserId, currentTimer ] );

	useEffect( () => {
		if ( authState?.auth_url ) {
			window.location.replace( authState.auth_url );
		}
	}, [ authState ] );

	const steps = [
		translate( 'Open the {{link/}} on your phone.', {
			components: {
				link: (
					<a href="https://apps.wordpress.com/get/?campaign=calypso-qrcode-apps">WordPress App</a>
				),
			},
		} ),
		translate( 'Tap the My Site Tab.' ),
		translate( 'Tap your Profile image in the top right corner of the screen.' ),
		translate( 'Tap the {{strong}}Scan QR Code{{/strong}} option.', {
			components: {
				strong: <strong />,
			},
		} ),
		translate( 'Point your phone to this screen to scan the code.' ),
	];

	return (
		<Card className="qr-code-login">
			<div className="qr-code-login__container">
				<TokenQRCode tokenData={ tokenData } />
			</div>

			<div className="qr-code-login__instructions">
				<h2 className="qr-code-login__heading">{ translate( 'Use QR Code to login' ) }</h2>
				<ol className="qr-code-login__steps">
					{ steps.map( ( step, index ) => (
						<li key={ 'step-' + index } className="qr-code-login__step">
							{ step }
						</li>
					) ) }
				</ol>
				<p>
					<a href="https://apps.wordpress.com/mobile/login-via-qr-code">Need help?</a>
				</p>
			</div>
		</Card>
	);
}

export default QRCodeLogin;
