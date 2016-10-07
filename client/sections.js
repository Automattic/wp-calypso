/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Internal dependencies
 */
const config = require( 'config' ),
	sections = require( config( 'project' ) );

const plugins = fs.readdirSync( path.join( __dirname, 'plugins' ) )
	.filter( node => fs.statSync( path.join( __dirname, 'plugins', node ) ).isDirectory() );

const pluginSections = sections.concat( plugins.map( plugin => {
	const pkg = JSON.parse( fs.readFileSync( path.join( __dirname, 'plugins', plugin, 'package.json' ) ) );
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
console.log( pluginSections.filter( section => !! section ) );
module.exports = sections.concat( pluginSections.filter( section => !! section ) );
