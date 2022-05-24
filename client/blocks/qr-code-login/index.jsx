import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import QRCode from 'qrcode.react';
import { useEffect, useState, useMemo } from 'react';
import qrCenter from 'calypso/assets/images/qr-login/wp.png';
import ExternalLink from 'calypso/components/external-link';
import { setStoredItem, getStoredItem } from 'calypso/lib/browser-storage';
import { useInterval } from 'calypso/lib/interval';

import './style.scss';

const AUTH_PULL_INTERVAL = 5000; // 5 seconds
const LOCALE_STORAGE_KEY = 'qr-login-token';

const isStillValidToken = ( tokenData ) => {
	if ( ! tokenData?.expires ) {
		return false;
	}
	return tokenData.expires > Date.now() / 1000;
};

const getLoginActionResponse = async ( action, args ) => {
	const url = `https://wordpress.com/wp-login.php?action=${ action }`;
	const body = new URLSearchParams( {
		...args,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
	} );

	const response = await fetch( url, {
		method: 'POST',
		credentials: 'include',
		body,
	} );

	let json_response = null;
	try {
		json_response = await response.json();
	} catch {
		json_response = false;
	}

	return json_response;
};

const fetchQRCodeData = async ( setTokenData, tokenData, anonymousUserId, setIsErrorState ) => {
	if ( isStillValidToken( tokenData ) ) {
		return;
	}

	if ( ! anonymousUserId ) {
		return;
	}
	// tokenData is set to null initially.
	// Lets wait till it is set to false when the local data is the just yet.
	if ( tokenData === null ) {
		return;
	}

	const responseData = await getLoginActionResponse( 'qr-code-token-request-endpoint', {
		anon_id: anonymousUserId,
	} );

	if ( responseData === false ) {
		setIsErrorState( true );
		return;
	}

	if ( isStillValidToken( responseData.data ) ) {
		setTokenData( responseData.data );
		setStoredItem( LOCALE_STORAGE_KEY, responseData.data );
		return;
	}
	setIsErrorState( true );
	return;
};

const fetchAuthState = async (
	setAuthState,
	setTokenData,
	tokenData,
	anonymousUserId,
	isErrorState,
	setIsErrorState,
	setPullInterval
) => {
	if ( ! tokenData ) {
		return;
	}

	if ( isErrorState ) {
		setPullInterval( null );
		return;
	}

	if ( ! anonymousUserId ) {
		return;
	}

	if ( ! isStillValidToken( tokenData ) ) {
		fetchQRCodeData( setTokenData, tokenData, anonymousUserId );
		return;
	}

	const { token, encrypted } = tokenData;

	const responseData = await getLoginActionResponse( 'qr-code-authentication-endpoint', {
		anon_id: anonymousUserId,
		token,
		data: encrypted,
	} );

	if ( responseData === false ) {
		setIsErrorState( true );
		setPullInterval( null );
		return;
	}

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
			size={ 300 }
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
	const [ tokenData, setTokenData ] = useState( null );
	const [ authState, setAuthState ] = useState( false );
	const [ pullInterval, setPullInterval ] = useState( AUTH_PULL_INTERVAL );
	const [ isErrorState, setIsErrorState ] = useState( false );

	const anonymousUserId = getTracksAnonymousUserId();

	// Set the error state if we don't have a anonymousUserId
	useEffect( () => {
		if ( ! anonymousUserId ) {
			setIsErrorState( true );
		}
	}, [ anonymousUserId, setIsErrorState ] );

	// Fetch QR code data.
	useEffect( () => {
		fetchQRCodeData( setTokenData, tokenData, anonymousUserId, setIsErrorState );
	}, [ setTokenData, tokenData, anonymousUserId, setIsErrorState ] );

	// Fetch the Auth Data.
	useInterval( () => {
		fetchAuthState(
			setAuthState,
			setTokenData,
			tokenData,
			anonymousUserId,
			isErrorState,
			setIsErrorState,
			setPullInterval
		);
	}, pullInterval );

	// Send the user to the login state.
	useEffect( () => {
		if ( authState?.auth_url ) {
			window.location.replace( authState.auth_url );
		}
	}, [ authState ] );

	useEffect( () => {
		getStoredItem( LOCALE_STORAGE_KEY ).then( ( localTokenData ) =>
			setTokenData( localTokenData ?? false )
		);
	}, [] );

	const steps = useMemo( () => [
		// translation: Link to the WordPress App.
		translate( 'Open the {{link}}%(wordpress)s App{{/link}} on your phone.', {
			args: {
				wordpress: 'WordPress',
			},
			components: {
				link: (
					<ExternalLink
						target="_blank"
						icon={ false }
						href="https://apps.wordpress.com/get/?campaign=calypso-qrcode-apps"
					/>
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
	] );

	if ( isErrorState ) {
		return (
			<Card className="qr-code-login">
				<p className="qr-code-login__token-error">
					{ translate( 'Mobile App QR Code login is currently unavailable.' ) }
				</p>
			</Card>
		);
	}

	return (
		<Card className="qr-code-login">
			<div className="qr-code-login__token">
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
					<ExternalLink
						target="_blank"
						icon={ false }
						href="https://apps.wordpress.com/mobile/login-via-qr-code"
					>
						{ translate( 'Need help?' ) }
					</ExternalLink>
				</p>
			</div>
		</Card>
	);
}

export default QRCodeLogin;
