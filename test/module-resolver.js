/* eslint-disable import/no-nodejs-modules */

const enhancedResolve = require( 'enhanced-resolve' );
const { packagesInMonorepo } = require( '../build-tools/lib/monorepo' );

const packages = packagesInMonorepo().map( ( pkg ) => pkg.name );
const resolver = enhancedResolve.create.sync( {
	extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
	mainFields: [ 'calypso:src', 'module', 'main' ],
	conditionNames: [ 'calypso:src', 'import', 'module', 'require' ],
} );

module.exports = function ( request, options ) {
	// Use enhanced-resolve only for packages in the monorepo, where we want to get `calypso:src`
	if ( packages.includes( request ) ) {
		return resolver( options.basedir, request );
	}
	return options.defaultResolver( request, options );
};
