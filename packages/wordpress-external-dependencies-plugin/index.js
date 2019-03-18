/**
 * External dependencies
 */
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

		compiler.hooks.compilation.tap( this.constructor.name, compilation => {
			compilation.hooks.additionalChunkAssets.tap( this.constructor.name, (/* chunks */) => {
				// Get entry points
				compilation.chunkGroups.forEach( chunkGroup => {
					if ( ! chunkGroup.isInitial() ) {
						return;
					}

					dependencyIteration: for ( const [ wpModule, { dependency } ] of wpModules.entries() ) {
						for ( const chunk of chunkGroup.chunks ) {
							for ( const chunkModule of chunk.modulesIterable ) {
								if ( chunkModule.userRequest === wpModule ) {
									this.entryDeps.has( chunkGroup )
										? this.entryDeps.get( chunkGroup ).add( dependency )
										: this.entryDeps.set( chunkGroup, new Set( [ dependency ] ) );
									continue dependencyIteration;
								}
							}
						}
					}
				} );
				for ( const [ entry, deps ] of this.entryDeps.entries() ) {
					const entryFiles = entry.getFiles();
					if ( entryFiles.length ) {
						const depsFile = entryFiles[ 0 ].replace( '.js', '.deps.json' );
						compilation.assets[ depsFile ] = new RawSource( JSON.stringify( Array.from( deps ) ) );
					}
				}
			} );
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
