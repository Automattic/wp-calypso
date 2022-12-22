const chunks = require( './dist/chunks-map.json' );

// merge all source references into the main `build.min.js` chunk
const merged = Object.keys( chunks ).reduce( ( acc, key ) => {
	acc[ 'build.min.js' ] = ( acc[ 'build.min.js' ] || [] ).concat(
		// filepaths need to be relative to the root of the project
		chunks[ key ].map( ( filepath ) => filepath.replace( /^\.\.\/\.\.\//, '' ) )
	);

	return acc;
}, {} );

require( 'fs' ).writeFileSync( './dist/chunks-map.json', JSON.stringify( merged ) );
