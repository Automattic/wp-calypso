const path = require( 'path' );
const babelConfig = require( '@automattic/calypso-babel-config' );

// We implicitly use browserslist configuration in package.json for build targets.

const config = babelConfig( {
	isBrowser: process.env.BROWSERSLIST_ENV !== 'server',
	outputPOT: path.join( __dirname, 'build/i18n-calypso/' ),
	importSource: '@emotion/react',
} );

// Jest evaluates transformed code as a CommonJS Script, so any surviving
// `import.meta` reference throws "Cannot use 'import.meta' outside a module".
// Replace it with `{}` under test so guards like `if ( import.meta.hot )` become
// dead code. Vite handles `import.meta.hot` natively at build time and does not
// use this Babel config; webpack also doesn't need this transform.
config.env = config.env || {};
config.env.test = config.env.test || {};
config.env.test.plugins = [
	...( config.env.test.plugins || [] ),
	function stripImportMeta( { types: t } ) {
		return {
			visitor: {
				MetaProperty( nodePath ) {
					if ( nodePath.node.meta.name === 'import' && nodePath.node.property.name === 'meta' ) {
						nodePath.replaceWith( t.objectExpression( [] ) );
					}
				},
			},
		};
	},
];

module.exports = config;
