/**
 * Internal dependencies
 */
var emitter = require( 'lib/mixins/emitter' );
var user = require( 'lib/user' )();

var emailVerification = {
	renderNotice: function( context ) {
		this.showVerifiedNotice = '1' === context.query.verified;

		if ( this.showVerifiedNotice ) {
			user.signalVerification();
		}

		this.emit( 'change' );
	}
};

/**
 * Mixins
 */
emitter( emailVerification );

/**
 * Expose `emailVerification` singleton
 */
module.exports = emailVerification;
