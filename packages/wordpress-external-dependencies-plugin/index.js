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

			for ( const [ entry, deps ] of this.entryDeps.entries() ) {
				const filename = `${ entry.options.name }.deps.json`;
				compilation.assets[ filename ] = new RawSource( JSON.stringify( Array.from( deps ) ) );
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
