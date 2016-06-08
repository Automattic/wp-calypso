/**
 * External dependencies
 */
var i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
var Emitter = require( 'lib/mixins/emitter' ),
	wpcom = require( 'lib/wp' ),
	user = require( 'lib/user' )();

/**
 * Initialize Username with defaults
 */
function Username() {
	if ( ! ( this instanceof Username ) ) {
		return new Username();
	}

	this.validation = false;
	this.hasUsernameSite = false;
}

Emitter( Username.prototype );

Username.prototype.validate = function( username ) {
	if ( username !== user.get().username ) {
	 	if ( username.length < 4 ) {
			this.validation = {
				error: 'invalid_input',
				message: i18n.translate( 'Usernames must be at least 4 characters.' )
			};

			this.emit( 'change' );
		} else if ( ! /^[a-z0-9]+$/.test( username ) ) {
			this.validation = {
				error: 'invalid_input',
				message: i18n.translate( 'Usernames can only contain lowercase letters (a-z) and numbers.' )
			};

			this.emit( 'change' );
		}  else {
			wpcom.undocumented().me().validateUsername( username, function( error, data ) {
				if ( error ) {
					this.validation = error;
				} else {
					this.validation = data;
					this.validation.validatedUsername = username;
				}

				this.emit( 'change' );
			}.bind( this ) );
		}
	} else {
		this.validation = false;
		this.emit( 'change' );
	}
};

Username.prototype.change = function( username, action, callback ) {
	wpcom.undocumented().me().changeUsername( username, action, function( error, data ) {
		if ( error ) {
			this.validation = error;
			this.emit( 'change' );
		} else {
			user.fetch();
		}

		if ( callback ) {
			callback( error, data );
		}
	}.bind( this ) );
};

Username.prototype.isUsernameValid = function() {
	return this.validation && true === this.validation.success;
};

Username.prototype.getValidationFailureMessage = function() {
	return this.validation && this.validation.message ? this.validation.message : null;
};

Username.prototype.getAllowedActions = function() {
	return this.validation && this.validation.allowed_actions ? this.validation.allowed_actions : {};
};

Username.prototype.getValidatedUsername = function() {
	return this.validation && this.validation.validatedUsername ? this.validation.validatedUsername : null;
};

Username.prototype.clearValidation = function() {
	this.validation = false;
	this.emit( 'change' );
};

/**
 * Expose Username
 */
module.exports = new Username();
