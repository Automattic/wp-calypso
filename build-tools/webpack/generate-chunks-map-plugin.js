const fs = require( 'fs' );
const path = require( 'path' );

/**
 * Plugin name.
 *
 * @type {string}
 */
const PLUGIN_NAME = 'GenerateChunksMap';

class GenerateChunksMapPlugin {
	constructor( { output = path.resolve( '.', 'map.json' ) } = {} ) {
		this.output = output;
	}

	apply( compiler ) {
		compiler.hooks.done.tap( PLUGIN_NAME, ( { compilation } ) => {
			// Generate chunks map
			const { chunks } = compilation;

			const chunksMap = {};
			for ( const chunk of chunks ) {
				// This logic assumes there is only one `.js`. If there are more than one `.js` file linked to a chunk,
				// this will be non deterministic as `chunk.files` iteration order is not guaranteed.
				const name = Array.from( chunk.files ).find( ( file ) => /\.js$/.test( file ) );
				if ( ! name ) {
					continue;
				}

				const modules = [ ...compilation.chunkGraph.getChunkModulesIterable( chunk ) ]
					.reduce( ( acc, item ) => acc.concat( item.modules || item ), [] )
					.map( ( { userRequest } ) => userRequest && path.relative( '.', userRequest ) )
					.filter( ( module ) => !! module );

				chunksMap[ name ] = modules;
			}

			// Write chunks map
			fs.writeFileSync( this.output, JSON.stringify( chunksMap ) );
		} );
	}
}

module.exports = GenerateChunksMapPlugin;
