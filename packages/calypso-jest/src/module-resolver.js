const enhancedResolve = require( 'enhanced-resolve' );

/**
 * Implements a custom resolver for Jest.
 *
 * We first try these fields in order (or their equivalent conditional export):
 *
 *   1) `calypso:src`: This is a sign that the package is in the monorepo. This property points to the _untranspiled_ source code
 *      (usually `./src/index.js`). This allows us to skip any package transpilation before it can be used by Webpack or Jest,
 *      saving some developer time.
 *   3) `main`: This is the default, it points to a CJS module. If the package is in the monorepo this points to a file that usually
 *      _does not_ exists, but it doesn't matter because all packages in the monorepo have `calypso:src`
 *
 * Once Jest supports ESM natively we can look for ESM packages (either using conditional export `import`, or the property `module` )
 */
const resolver = enhancedResolve.create.sync( {
	extensions: [ '.json', '.js', '.jsx', '.ts', '.tsx' ],
	mainFields: [ 'calypso:src', 'main' ],
	conditionNames: [ 'calypso:src', 'node', 'require' ],
} );

module.exports = function ( request, options ) {
	return resolver( options.basedir, request ).replace( /\0#/g, '#' );
};
