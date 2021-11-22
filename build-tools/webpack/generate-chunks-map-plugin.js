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
				const files = chunk.files;
				const name = Array.from( files ).find( ( file ) => /\.js$/.test( file ) ) || files[ 0 ];
				const modules = [ ...chunk.modulesIterable ]
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
