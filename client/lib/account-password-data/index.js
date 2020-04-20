/**
 * External dependencies
 */

import { map, merge, pick, random, sample } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:password-generator' );

/**
 * Internal dependencies
 */
import makeEmitter from 'lib/mixins/emitter';
import wp from 'lib/wp';

const wpcom = wp.undocumented();

/**
 * Initialize AccountPasswordData with defaults
 */
function AccountPasswordData() {
	this.validatedPassword = null;
	this.charsets = {
		lowerChars: 'abcdefghjkmnpqrstuvwxyz'.split( '' ),
		upperChars: 'ABCDEFGHJKMNPQRSTUVWXYZ'.split( '' ),
		digitChars: '23456789'.split( '' ),
		specialChars: '!@#$%^&*'.split( '' ),
	};

	this.letterCharsets = pick( this.charsets, [ 'lowerChars', 'upperChars' ] );
}

makeEmitter( AccountPasswordData.prototype );

AccountPasswordData.prototype.validate = function ( password, callback ) {
	debug( 'Password validate method called' );

	if ( '' === password ) {
		this.clearValidatedPassword();
		callback( null );
		return;
	}

	wpcom.me().validatePassword(
		password,
		function ( error, data ) {
			if ( error ) {
				debug( 'Password is not valid. Please try again.' );
				callback( error );
				return;
			}

			// Store the results from the API call as well as the password
			// string in this.validatedPassword
			this.validatedPassword = merge( { password: password }, data );

			debug( JSON.stringify( this.validatedPassword ) );

			this.emit( 'change' );
			callback( null, error );
		}.bind( this )
	);
};

AccountPasswordData.prototype.passwordValidationSuccess = function () {
	if ( null !== this.validatedPassword ) {
		return !! this.validatedPassword.passed;
	}

	return false;
};

AccountPasswordData.prototype.passwordValidationFailed = function () {
	if ( null !== this.validatedPassword ) {
		return ! this.validatedPassword.passed;
	}

	return true;
};

AccountPasswordData.prototype.hasValidatedPassword = function () {
	return null !== this.validatedPassword;
};

AccountPasswordData.prototype.clearValidatedPassword = function () {
	this.validatedPassword = null;
};

AccountPasswordData.prototype.getValidationFailures = function () {
	if ( null === this.validatedPassword ) {
		return [];
	}

	return this.validatedPassword.test_results.failed;
};

AccountPasswordData.prototype.generate = function () {
	let i,
		length = random( 12, 35 ),
		chars = map( this.charsets, function ( charset ) {
			// Ensure one character from each character set is in the password
			return sample( charset );
		} );

	for ( i = 0; i < length; i++ ) {
		if ( 0 === i % 4 ) {
			chars.push( sample( sample( this.letterCharsets ) ) );
		} else {
			// Get a random character from a random character set
			chars.push( sample( sample( this.charsets ) ) );
		}
	}

	return chars.join( '' );
};

export default new AccountPasswordData();
