import wpcom from 'lib/wp';
var _backend;

const POST = 'POST';

function strToBin(str) {
	str = str.replace(/[-_]/g, function(m) { return m[0] === '-' ? '+' : '/'; });
	return Uint8Array.from(atob(str), c => c.charCodeAt(0));
}

function binToStr(bin) {
	return btoa(new Uint8Array(bin).reduce(
		(s, byte) => s + String.fromCharCode(byte), ''
	));
}

function isBrowser() {
	try {
		if (!window) return false;
	} catch (err) {
		return false;
	}
	return true;
}

function credentialListConversion(list) {
	return list.map(item => {
		const cred = {
			type: item.type,
			id: strToBin(item.id)
		};
		if ('transports' in item && item.transports.length > 0) {
			cred.transports = list.transports;
		}
		return cred;
	});
}

function wpcomRequestPromise( path, _data, method ) {
	const data = _data || {};
	if ( process.env.NODE_ENV === 'development' ) {
		data.hostname = window.location.hostname;
	}

	return new Promise( function ( resolve, reject ) {
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
	if ( !_backend ) {
		_backend = new Promise( function( resolve, reject ) {
			function notSupported() {
				resolve( { webauthn: null } );
			}
			if ( !isBrowser() ) {
				return notSupported();
			}
			if ( !window.isSecureContext ) {
				return notSupported();
			}
			if ( window.PublicKeyCredential === undefined ||
			    typeof window.PublicKeyCredential !== "function" ||
			    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== "function" ) {
				    return notSupported();
			    }
			    resolve( { webauthn: true } );
		} );
	}
	return _backend.then( backend => !!backend.webauthn );
}

function register( reactComponent ) {
	return wpcomRequestPromise( '/me/two-step/security-key/registration_challenge' )
	.then( (options) => {
		const makeCredentialOptions = {};
		makeCredentialOptions.rp = options.rp;
		makeCredentialOptions.user = options.user;
		makeCredentialOptions.user.id = strToBin(options.user.id);
		makeCredentialOptions.challenge = strToBin(options.challenge);
		makeCredentialOptions.pubKeyCredParams = options.pubKeyCredParams;

		if ( 'timeout' in options ) {
			makeCredentialOptions.timeout = options.timeout;
		}
		if ('excludeCredentials' in options) {
			makeCredentialOptions.excludeCredentials = credentialListConversion(options.excludeCredentials);
		}
		if ('authenticatorSelection' in options) {
			makeCredentialOptions.authenticatorSelection = options.authenticatorSelection;
		}
		if ('attestation' in options) {
			makeCredentialOptions.attestation = options.attestation;
		}
		if ('extensions' in options) {
			makeCredentialOptions.extensions = options.extensions;
		}
		return navigator.credentials.create({
			"publicKey": makeCredentialOptions
		});
	}).then(attestation => {
		const publicKeyCredential = {};
		if ('id' in attestation) {
			publicKeyCredential.id = attestation.id;
		}
		if ('type' in attestation) {
			publicKeyCredential.type = attestation.type;
		}
		if ('rawId' in attestation) {
			publicKeyCredential.rawId = binToStr(attestation.rawId);
		}
		if (!attestation.response) {
			Promise.reject( 'response lacking "response" attribute' );
		}
		const response = {};
		response.clientDataJSON = binToStr(attestation.response.clientDataJSON);
		response.attestationObject = binToStr(attestation.response.attestationObject);
		publicKeyCredential.response = response;

		return wpcomRequestPromise( '/me/two-step/security-key/registration_validate', {
			data: JSON.stringify(publicKeyCredential)
		}, POST);
	});
}

function authenticate() {

}

export default { isSupported, register, authenticate }
