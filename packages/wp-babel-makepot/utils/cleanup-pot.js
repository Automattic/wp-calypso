const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );

module.exports = ( dir, output ) => {
	const outputPath = path.resolve( output );
	const potGlob = path.resolve( dir, '*.pot' );
	const potFiles = glob.sync( potGlob, { nodir: true, absolute: true } );

	// console.log( `Cleaning up ${ potFiles.length } .pot files in ${ dir }...` );
	// console.log( potFiles.map( ( filePath ) => `- ${ filePath }` ).join( '\n' ) );
	potFiles
		.filter( ( filePath ) => filePath !== outputPath )
		.forEach( ( filePath ) => fs.rmSync( filePath, { force: true } ) );
};
