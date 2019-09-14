/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import config from 'config';

let _backend;

const POST = 'POST';

function strToBin( str ) {
	str = str.replace( /[-_]/g, function( m ) {
		return m[ 0 ] === '-' ? '+' : '/';
	} );
	return Uint8Array.from( atob( str ), c => c.charCodeAt( 0 ) );
}

function binToStr( bin ) {
	return btoa( new Uint8Array( bin ).reduce( ( s, byte ) => s + String.fromCharCode( byte ), '' ) );
}

function isBrowser() {
	try {
		if ( ! window ) return false;
	} catch ( err ) {
		return false;
	}
	return true;
}

function credentialListConversion( list ) {
	return list.map( item => {
		const cred = {
			type: item.type,
			id: strToBin( item.id ),
		};
		if ( 'transports' in item && item.transports.length > 0 ) {
			cred.transports = list.transports;
		}
		return cred;
	} );
}

function wpcomApiRequest( path, _data, method ) {
	const data = _data || {};
	if ( process.env.NODE_ENV === 'development' ) {
		data.hostname = window.location.hostname;
	}

	return new Promise( function( resolve, reject ) {
		const promise = function( err, result ) {
			if ( err ) {
				reject( err );
				return;
			}
			resolve( result );
		};
		if ( POST === method ) {
			wpcom.req.post( path, data, promise );
		} else {
			wpcom.req.get( path, data, promise );
		}
	} );
}

function isSupported() {
	if ( ! _backend ) {
		_backend = new Promise( function( resolve ) {
			function notSupported() {
				resolve( { webauthn: null } );
			}
			if ( ! isBrowser() ) {
				return notSupported();
			}
			if ( ! window.isSecureContext ) {
				return notSupported();
			}
			if (
				window.PublicKeyCredential === undefined ||
				typeof window.PublicKeyCredential !== 'function' ||
				typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !==
					'function'
			) {
				return notSupported();
			}
			resolve( { webauthn: true } );
		} );
	}
	return _backend.then( backend => !! backend.webauthn );
}

function register() {
	return wpcomApiRequest( '/me/two-step/security-key/registration_challenge' )
		.then( options => {
			const makeCredentialOptions = {};
			makeCredentialOptions.rp = options.rp;
			makeCredentialOptions.user = options.user;
			makeCredentialOptions.user.id = strToBin( options.user.id );
			makeCredentialOptions.challenge = strToBin( options.challenge );
			makeCredentialOptions.pubKeyCredParams = options.pubKeyCredParams;

			if ( 'timeout' in options ) {
				makeCredentialOptions.timeout = options.timeout;
			}
			if ( 'excludeCredentials' in options ) {
				makeCredentialOptions.excludeCredentials = credentialListConversion(
					options.excludeCredentials
				);
			}
			if ( 'authenticatorSelection' in options ) {
				makeCredentialOptions.authenticatorSelection = options.authenticatorSelection;
			}
			if ( 'attestation' in options ) {
				makeCredentialOptions.attestation = options.attestation;
			}
			if ( 'extensions' in options ) {
				makeCredentialOptions.extensions = options.extensions;
			}
			return navigator.credentials.create( {
				publicKey: makeCredentialOptions,
			} );
		} )
		.then( attestation => {
			const publicKeyCredential = {};
			if ( 'id' in attestation ) {
				publicKeyCredential.id = attestation.id;
			}
			if ( 'type' in attestation ) {
				publicKeyCredential.type = attestation.type;
			}
			if ( 'rawId' in attestation ) {
				publicKeyCredential.rawId = binToStr( attestation.rawId );
			}
			if ( ! attestation.response ) {
				Promise.reject( 'response lacking "response" attribute' );
			}
			const response = {};
			response.clientDataJSON = binToStr( attestation.response.clientDataJSON );
			response.attestationObject = binToStr( attestation.response.attestationObject );
			publicKeyCredential.response = response;

			return wpcomApiRequest(
				'/me/two-step/security-key/registration_validate',
				{
					data: JSON.stringify( publicKeyCredential ),
				},
				POST
			);
		} );
}
function wpcomLoginRequest( action, form ) {
	form.append( 'client_id', config( 'wpcom_signup_id' ) );
	form.append( 'client_secret', config( 'wpcom_signup_key' ) );
	if ( process.env.NODE_ENV === 'development' ) {
		form.append( 'dev_hostname', window.location.hostname );
	}
	return fetch( `https://wordpress.com/wp-login.php?action=${ action }`, {
		method: 'POST',
		body: form,
		credentials: 'include',
	} ).then( response => response.json() );
}

function authenticate( wpcom_user_id, nonce ) {
	let form = new FormData();
	form.append( 'user_id', wpcom_user_id );
	form.append( 'two_step_nonce', nonce );
	form.append( 'auth_type', 'u2f' );

	return wpcomLoginRequest( 'u2f-challenge-endpoint', form )
		.then( response => {
			const parameters = response.data;
			const requestOptions = {};

			requestOptions.challenge = strToBin( parameters.challenge );
			requestOptions.timeout = 6000;
			if ( 'rpId' in parameters ) {
				requestOptions.rpId = parameters.rpId;
			}
			if ( 'allowCredentials' in parameters ) {
				requestOptions.allowCredentials = credentialListConversion( parameters.allowCredentials );
			}
			return navigator.credentials.get( { publicKey: requestOptions } );
		} )
		.then( assertion => {
			const publicKeyCredential = {};
			if ( 'id' in assertion ) {
				publicKeyCredential.id = assertion.id;
			}
			if ( 'type' in assertion ) {
				publicKeyCredential.type = assertion.type;
			}
			if ( 'rawId' in assertion ) {
				publicKeyCredential.rawId = binToStr( assertion.rawId );
			}
			if ( ! assertion.response ) {
				throw "Get assertion response lacking 'response' attribute";
			}

			const _response = assertion.response;
			publicKeyCredential.response = {
				clientDataJSON: binToStr( _response.clientDataJSON ),
				authenticatorData: binToStr( _response.authenticatorData ),
				signature: binToStr( _response.signature ),
			};
			if ( _response.userHandle ) {
				publicKeyCredential.response.userHandle = binToStr( _response.userHandle );
			}
			form = new FormData();
			form.append( 'user_id', wpcom_user_id );
			form.append( 'client_data', JSON.stringify( publicKeyCredential ) );

			return wpcomLoginRequest( 'u2f-authentication-endpoint', form );
		} );
}

export default { isSupported, register, authenticate };
