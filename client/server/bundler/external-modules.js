/**
 * External Dependencies
 */
const { builtinModules } = require( 'module' );
const { join } = require( 'path' );
const ExternalModule = require( 'webpack' ).ExternalModule;

function getModule( request ) {
	const parts = request.split( '/' );
	if ( parts[ 0 ].startsWith( '@' ) ) {
		return parts[ 0 ] + '/' + parts[ 1 ];
	}
	return parts[ 0 ];
}

module.exports = class ExternalModulesWriter {
	constructor( options ) {
		this.options = {
			path: './build',
			filename: 'modules.json',
			...options,
		};
	}

	apply( compiler ) {
		compiler.hooks.emit.tapAsync( 'ExternalModulesWriter', ( compilation, callback ) => {
			const externalModules = new Set();

			function processModule( module ) {
				// Descend into submodules of a `ConcatenatedModule` instance
				if ( module.modules ) {
					for ( const subModule of module.modules ) {
						processModule( subModule );
					}

					return;
				}

				if ( ! ( module instanceof ExternalModule ) ) {
					return;
				}

				const requestModule = getModule( module.userRequest );

				// native Node.js module, not in node_modules
				if ( builtinModules.includes( requestModule ) ) {
					return;
				}

				// loading local file by relative path, not in node_modules
				if ( requestModule.startsWith( './' ) || requestModule.startsWith( '../' ) ) {
					return;
				}

				externalModules.add( requestModule );
			}

			for ( const module of compilation.modules ) {
				processModule( module );
			}

			const json = JSON.stringify( Array.from( externalModules ), null, 2 );
			const { mkdir, writeFile } = compiler.outputFileSystem;
			const { path, filename } = this.options;
			mkdir( path, { recursive: true }, ( err ) => {
				if ( err ) {
					return callback( err );
				}
				writeFile( join( path, filename ), json, 'utf8', callback );
			} );
		} );
	}
};
