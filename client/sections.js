/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const config = require( 'config' );
const	sections = require( config( 'project' ) );
const extensions = require( 'extensions' );

const extensionSections = sections.concat( extensions.map( extension => {
	const pkg = JSON.parse( fs.readFileSync( path.join( __dirname, 'extensions', extension, 'package.json' ) ) );
	return pkg.section;
} ) );

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
module.exports = sections.concat( extensionSections.filter( Boolean ) );
