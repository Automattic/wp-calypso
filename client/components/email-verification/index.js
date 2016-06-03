/**
 * External dependencies
 */
var startsWith = require( 'lodash/startsWith' );

/**
 * Internal dependencies
 */
var emitter = require( 'lib/mixins/emitter' );
var userUtils = require( 'lib/user/utils' );

var emailVerification = {
	renderNotice: function( context ) {
		this.showUnverifiedNotice = ! startsWith( context.path, '/checkout' ) && ! startsWith( context.path, '/plans' );
		this.showVerifiedNotice = '1' === context.query.verified;

		if ( this.showVerifiedNotice ) {
			userUtils.signalVerification();
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
