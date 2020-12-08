/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );

/**
 * This function scans the /client/extensions directory in order to generate a map that looks like this:
 * {
 *   sensei: 'absolute/path/to/wp-calypso/client/extensions/sensei',
 *   woocommerce: 'absolute/path/to/wp-calypso/client/extensions/woocommerce',
 *   ....
 * }
 *
 * Providing webpack with these aliases instead of telling it to scan client/extensions for every
 * module resolution speeds up builds significantly.
 *
 * @param obj obj
 * @param obj.extensionsDirectory Directory where the extensions live
 * @returns {object} a mapping of extension name to path
 */
function getAliasesForExtensions( { extensionsDirectory } ) {
	const extensionsNames = fs
		.readdirSync( extensionsDirectory )
		.filter( ( filename ) => filename.indexOf( '.' ) === -1 ); // heuristic for finding directories

	const aliasesMap = {};
	extensionsNames.forEach(
		( extensionName ) =>
			( aliasesMap[ extensionName ] = path.join( extensionsDirectory, extensionName ) )
	);
	return aliasesMap;
}

module.exports = getAliasesForExtensions;
