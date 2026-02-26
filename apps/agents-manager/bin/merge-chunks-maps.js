const fs = require( 'fs' );
const path = require( 'path' );

const distDir = path.resolve( __dirname, '..', 'dist' );
const merged = {};

for ( const file of fs.readdirSync( distDir ) ) {
	if ( file.startsWith( 'chunks-map-' ) && file.endsWith( '.json' ) ) {
		Object.assign( merged, JSON.parse( fs.readFileSync( path.join( distDir, file ) ) ) );
	}
}

fs.writeFileSync( path.join( distDir, 'chunks-map.json' ), JSON.stringify( merged ) );
