/**
 * External Dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const { builtinModules } = require( 'module' );

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
		compiler.hooks.afterEmit.tapAsync( 'ExternalModulesWriter', ( compilation ) => {
			const externalModules = new Set();

			for ( const module of compilation.modules ) {
				if ( ! module.external ) {
					continue;
				}

				const requestModule = getModule( module.userRequest );

				// native Node.js module, not in node_modules
				if ( builtinModules.includes( requestModule ) ) {
					continue;
				}

				// loading local file by relative path, not in node_modules
				if ( requestModule.startsWith( './' ) || requestModule.startsWith( '../' ) ) {
					continue;
				}

				externalModules.add( requestModule );
			}

			fs.writeFileSync(
				path.join( this.options.path, this.options.filename ),
				JSON.stringify( Array.from( externalModules ), null, 2 ),
				'utf8'
			);
		} );
	}
};
