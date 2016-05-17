/**
 * External dependencies
 */
const config = require( 'config' );

/**
 * Module variables
 */
const sections = [];

if ( config.isEnabled( 'mailing-lists/unsubscribe' ) ) {
	sections.push( {
		name: 'mailing-lists',
		paths: [ '/mailing-lists' ],
		module: 'mailing-lists',
		enableLoggedOut: true
	} );
}

module.exports = sections;
