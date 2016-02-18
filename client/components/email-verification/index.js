/**
 * External dependencies
 */
var startsWith = require( 'lodash/startsWith' );

/**
 * Internal dependencies
 */
var emitter = require( 'lib/mixins/emitter' );

var emailVerification = {
	renderNotice: function( context ) {
		this.showUnverifiedNotice = ! startsWith( context.path, '/checkout' ) && ! startsWith( context.path, '/plans' );
		this.showVerifiedNotice = '1' === context.query.verified;
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
