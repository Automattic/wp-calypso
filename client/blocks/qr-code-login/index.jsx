import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { ExternalLink } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Notice } from '@wordpress/components';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import qrCenter from 'calypso/assets/images/qr-login/app.png';
import { setStoredItem, getStoredItem } from 'calypso/lib/browser-storage';
import { useInterval } from 'calypso/lib/interval';
import { postLoginRequest, getErrorFromHTTPError } from 'calypso/state/login/utils';
import { JetpackQRCodeLogin } from './jetpack';

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
	return postLoginRequest( action, {
		...args,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
	} )
		.then( ( response ) => {
			if ( response.ok ) {
				return response;
			}
			return response;
		} )
		.catch( ( httpError ) => {
			return Promise.reject( getErrorFromHTTPError( httpError ) );
		} );
};

export function TokenQRCode( { tokenData } ) {
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
		<QRCodeSVG
			value={ localizeUrl(
				`https://apps.wordpress.com/get/?campaign=login-qr-code#qr-code-login?token=${ token }&data=${ encrypted }`
			) }
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

function QRCodeErrorCard() {
	const translate = useTranslate();

	return (
		<div className="qr-code-login is-error">
			<div className="qr-code-login__token-error">
				<h1 className="qr-code-login-page__heading">{ translate( 'Log in via Jetpack app' ) }</h1>
				<p>{ translate( 'Mobile App QR Code login is currently unavailable.' ) }</p>
			</div>
		</div>
	);
}

function QRCodeLogin( { redirectToAfterLoginUrl, isJetpack = false } ) {
	const translate = useTranslate();
	const [ tokenState, setTokenState ] = useState( null );
	const [ authState, setAuthState ] = useState( false );
	const [ isErrorState, setIsErrorState ] = useState( false );
	const [ pullInterval, setPullInterval ] = useState( AUTH_PULL_INTERVAL );

	const anonymousUserId = getTracksAnonymousUserId();

	const fetchQRCodeData = async ( tokenData, anonId ) => {
		if ( isStillValidToken( tokenData ) ) {
			return;
		}

		if ( ! anonId ) {
			return;
		}
		// tokenData is set to null initially.
		// Lets wait till it is set to false when the local data is the just yet.
		if ( tokenData === null ) {
			return;
		}

		try {
			const responseData = await getLoginActionResponse( 'qr-code-token-request-endpoint', {
				anon_id: anonId,
			} );
			if ( isStillValidToken( responseData.body.data ) ) {
				setTokenState( responseData.body.data );
				setStoredItem( LOCALE_STORAGE_KEY, responseData.body.data );
				return;
			}
		} catch {
			setIsErrorState( true );
			return;
		}
		setIsErrorState( true );
	};

	const fetchAuthState = async ( tokenData, anonId, isInError ) => {
		if ( ! tokenData ) {
			return;
		}

		if ( isInError ) {
			setPullInterval( null );
			return;
		}

		if ( ! anonymousUserId ) {
			return;
		}

		if ( ! isStillValidToken( tokenData ) ) {
			fetchQRCodeData( tokenData, anonId );
			return;
		}

		const { token, encrypted } = tokenData;
		try {
			const responseData = await getLoginActionResponse( 'qr-code-authentication-endpoint', {
				anon_id: anonId,
				token,
				data: encrypted,
			} );
			setAuthState( responseData.body.data );
		} catch ( error ) {
			if ( error.code !== 'auth_missing' ) {
				setIsErrorState( true );
				setPullInterval( null );
			}
			return;
		}
	};

	// Set the error state if we don't have a anonymousUserId
	useEffect( () => {
		if ( ! anonymousUserId ) {
			setIsErrorState( true );
		}
	}, [ anonymousUserId ] );

	// Fetch QR code data.
	useEffect( () => {
		fetchQRCodeData( tokenState, anonymousUserId );
	}, [ tokenState, anonymousUserId ] );

	// Fetch the Auth Data.
	useInterval( () => {
		fetchAuthState( tokenState, anonymousUserId, isErrorState );
	}, pullInterval );

	// Send the user to the login state.
	useEffect( () => {
		if ( authState?.auth_url ) {
			// if redirect URL is set, append to to the response URL as a query param.
			if ( redirectToAfterLoginUrl ) {
				authState.auth_url = addQueryArgs( authState.auth_url, {
					redirect_to: redirectToAfterLoginUrl,
				} );
			}
			// Clear the data.
			setStoredItem( LOCALE_STORAGE_KEY, null );
			window.location.replace( authState.auth_url );
		}
	}, [ authState, redirectToAfterLoginUrl ] );

	useEffect( () => {
		getStoredItem( LOCALE_STORAGE_KEY ).then( ( storedTokenData ) =>
			setTokenState( storedTokenData ?? false )
		);
	}, [] );

	const steps = [
		// translation: Link to the Jetpack App.
		translate( 'Open the {{link}}%(name)s App{{/link}} on your phone.', {
			args: {
				name: 'Jetpack',
			},
			components: {
				link: (
					<ExternalLink target="_blank" href="https://jetpack.com/app?campaign=login-qr-code" />
				),
			},
		} ),
		translate( 'Tap the {{strong}}Me{{/strong}} tab.', {
			components: {
				strong: <strong />,
			},
		} ),
		translate( 'Tap the {{strong}}Scan Login Code{{/strong}} option.', {
			components: {
				strong: <strong />,
			},
		} ),
		translate( 'Point your phone to this screen to scan the code.' ),
	];

	const notice = translate(
		'Logging in via the Jetpack app is {{strong}}not available{{/strong}} to accounts with two-factor authentication enabled.',
		{
			components: {
				strong: <strong />,
			},
		}
	);

	if ( isErrorState ) {
		return <QRCodeErrorCard />;
	}

	if ( isJetpack ) {
		return <JetpackQRCodeLogin tokenState={ tokenState } />;
	}

	return (
		<div className="qr-code-login">
			<div className="qr-code-login__token">
				<TokenQRCode tokenData={ tokenState } />
			</div>

			<div className="qr-code-login__instructions">
				<h1 className="qr-code-login-page__heading">{ translate( 'Log in via Jetpack app' ) }</h1>
				<Notice isDismissible={ false } status="warning">
					<p>{ notice }</p>
				</Notice>
				<ol className="qr-code-login__steps">
					{ steps.map( ( step, index ) => (
						<li key={ 'step-' + index } className="qr-code-login__step">
							{ step }
						</li>
					) ) }
				</ol>
			</div>
		</div>
	);
}

export default QRCodeLogin;
