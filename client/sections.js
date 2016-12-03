/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const config = require( 'config' );
const sections = require( config( 'project' ) );
const extensions = require( 'extensions' );

const extensionSections = extensions.map( extension => {
	try {
		const pkg = JSON.parse( fs.readFileSync( path.join( __dirname, 'extensions', extension, 'package.json' ) ) );
		return pkg.env_id.indexOf( config( 'env_id' ) ) > -1
			? pkg.section
			: null;
	} catch ( e ) {
		return null;
	}
} );

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
