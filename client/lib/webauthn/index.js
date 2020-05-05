/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { translate } from 'i18n-calypso';
import config from 'config';
import { create, supported } from '@github/webauthn-json';

const POST = 'POST';

function wpcomApiRequest( path, _data, method ) {
	const data = _data || {};
	if ( 'production' !== config( 'env_id' ) ) {
		data.hostname = window.location.hostname;
	}

	return new Promise( function ( resolve, reject ) {
		const promise = function ( err, result ) {
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

function isBrowser() {
	try {
		if ( ! window ) return false;
	} catch ( err ) {
		return false;
	}
	return true;
}

export function isWebAuthnSupported() {
	return isBrowser() && supported();
}

export function registerSecurityKey( keyName = null ) {
	return wpcomApiRequest( '/me/two-step/security-key/registration_challenge' )
		.then( ( options ) => create( { publicKey: options } ) )
		.then( ( response ) => {
			return wpcomApiRequest(
				'/me/two-step/security-key/registration_validate',
				{
					data: JSON.stringify( response ),
					name: keyName,
				},
				POST
			);
		} )
		.catch( ( error ) => {
			switch ( error.name ) {
				case 'InvalidStateError':
					return Promise.reject( {
						context: 'PublicKeyCredential',
						error: 'DuplicateKey',
						message: translate( 'Security key has already been registered.' ),
					} );
				case 'NotAllowedError':
					return Promise.reject( {
						context: 'PublicKeyCredential',
						error: 'TimeoutCanceled',
						message: translate( 'Security key interaction timed out or canceled.' ),
					} );
				case 'AbortError':
					return Promise.reject( {
						context: 'PublicKeyCredential',
						error: 'Canceled',
						message: translate( 'Security key interaction canceled.' ),
					} );
				case 'NotSupportedError':
				case 'SecurityError':
				default:
					return Promise.reject( {
						context: 'PublicKeyCredential',
						error: 'Unknown',
						message: translate( 'Security key registration error.' ),
					} );
			}
		} );
}
