/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const sass = require( 'sass' );

// Prepare the input
const inputFile = path.join( __dirname, 'src', 'style.scss' );
const contents = fs.readFileSync( inputFile, 'utf8' );

// Prepare the output
const buildDir = path.join( __dirname, 'build-style' );
if ( ! fs.existsSync( buildDir ) ) {
	fs.mkdirSync( buildDir, { recursive: true } );
}
const outputFile = path.join( buildDir, 'style.css' );

// TODO: check what'd be the proper path
const baseStylesPath = path.join(
	__dirname,
	'../../node_modules/@wordpress/base-styles'
);
const importList = [
	'colors',
	'breakpoints',
	'variables',
	'mixins',
	'animations',
	'z-index',
	'default-custom-properties',
]
	.map( ( imported ) => `@import "${ imported }";` )
	.join( ' ' );

try {
	sass.render(
		{
			file: inputFile,
			includePaths: [ baseStylesPath ],
			data: ''.concat( '@use "sass:math";', importList, contents ),
		},
		function ( error, result ) {
			if ( error ) {
				console.error( 'SASS Error:', error.message );
				console.error( 'Line:', error.line );
				console.error( 'Column:', error.column );
				console.error( 'File:', error.file );

				process.exit( 1 );
			}

			fs.writeFileSync( outputFile, result.css );
		}
	);
} catch ( error ) {
	console.error( 'Script Error:', error );

	process.exit( 1 );
}
