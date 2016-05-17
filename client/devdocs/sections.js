/**
 * External dependencies
 */
const config = require( 'config' );

/**
 * Module variables
 */
const sections = [];

if ( config.isEnabled( 'devdocs' ) ) {
	sections.push( {
		name: 'devdocs',
		paths: [ '/devdocs' ],
		module: 'devdocs',
		secondary: true,
		enableLoggedOut: true
	} );

	sections.push( {
		name: 'devdocs',
		paths: [ '/devdocs/start' ],
		module: 'devdocs',
		secondary: false,
		enableLoggedOut: true
	} );
}

module.exports = sections;
