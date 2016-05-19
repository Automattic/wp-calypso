/**
 * External dependencies
 */
const config = require( 'config' );

/**
 * Module variables
 */
const sections = [];

if ( config.isEnabled( 'oauth' ) ) {
	sections.push( {
		name: 'auth',
		paths: [ '/login' ],
		module: 'auth',
		secondary: false,
		enableLoggedOut: true
	} );
}

module.exports = sections;
