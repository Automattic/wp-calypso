/**
 * Node dependencies
 */
const fs = require( 'fs' );

/**
 * Internal dependencies
 */
const config = require( './config' );
const parser = require( './parser' );
const generator = require( './generator' );
const getManifest = require( './manifest' );

const parsedModules = parser( config.dataNamespaces );
generator( parsedModules, config.dataDocsOutput );
const rootManifest = require( config.rootManifest );
const dataModuleManifest = getManifest( parsedModules, config.packages );

fs.writeFileSync(
	config.manifestOutput,
	JSON.stringify( rootManifest.concat( dataModuleManifest ), undefined, '\t' )
);
