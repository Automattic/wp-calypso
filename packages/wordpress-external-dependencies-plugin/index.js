/**
 * External dependencies
 */
const { createHash } = require( 'crypto' );
const { ExternalsPlugin } = require( 'webpack' );
const { RawSource } = require( 'webpack-sources' );

/**
 * Internal dependencies
 */
const wpModules = require( './wp-modules' );

class WordPressExternalDependenciesPlugin {
	constructor() {
		this.externalsPlugin = new ExternalsPlugin( 'global', [ wpExternals ] );

		this.entryDeps = new Map();
	}

	apply( compiler ) {
		this.externalsPlugin.apply( compiler );

		compiler.hooks.emit.tapAsync( this.constructor.name, ( compilation, callback ) => {
			for ( const [ , entrypoint ] of compilation.entrypoints.entries() ) {
				// labelled loop to continue when nested dep is found
				dependencyIteration: for ( const [ wpModule, { dependency } ] of wpModules.entries() ) {
					for ( const chunk of entrypoint.chunks ) {
						for ( const chunkModule of chunk.modulesIterable ) {
							if ( chunkModule.userRequest === wpModule ) {
								this.entryDeps.has( entrypoint )
									? this.entryDeps.get( entrypoint ).add( dependency )
									: this.entryDeps.set( entrypoint, new Set( [ dependency ] ) );
								continue dependencyIteration;
							}
						}
					}
				}
			}

			const filename = compilation.outputOptions.filename.replace( /.js$/, '.deps.json' );
			for ( const [ entry, deps ] of this.entryDeps.entries() ) {
				const stableDeps = Array.from( deps );
				stableDeps.sort();
				const chunkId = `depschunk_${ entry.id }`;
				const moduleId = `depsmodule_${ entry.id }`;

				// Act like a chunk or module for paths
				const data = {
					contentHashType: 'json',
					chunk: {
						entryModule: entry.getRuntimeChunk().entryModule,
						id: chunkId,
						hash: createHash( 'sha256' )
							.update( chunkId )
							.digest( 'hex' ),
						contentHash: {
							json: createHash( 'sha256' )
								.update( JSON.stringify( stableDeps ) )
								.digest( 'hex' ),
						},
					},
					module: {
						id: moduleId,
						hash: createHash( 'sha256' )
							.update( moduleId )
							.digest( 'hex' ),
					},
				};
				data.chunk.hashWithLength = length => data.chunk.hash.substr( 0, length );
				data.chunk.contentHashWithLength = length =>
					data.chunk.contentHash[ data.chunk.contentHashType ].substr( 0, length );
				data.module.hashWithLength = length => data.module.hash.substr( 0, length );

				const assetPath = compilation.getPath( filename, data );
				compilation.assets[ assetPath ] = new RawSource( JSON.stringify( Array.from( deps ) ) );
			}

			callback();
		} );
	}
}

function wpExternals( context, request, callback ) {
	if ( wpModules.has( request ) ) {
		return callback( null, `root ${ wpModules.get( request ).globalName }` );
	}
	return callback();
}

module.exports = WordPressExternalDependenciesPlugin;
