const { existsSync, mkdirSync, writeFileSync } = require( 'fs' );
const { dirname, join } = require( 'path' );
const postcss = require( 'postcss' );
const postcssCustomProperties = require( 'postcss-custom-properties' );
const { renderSync } = require( 'sass' );

const INPUT_FILE = join( __dirname, '..', 'src', 'calypso-color-schemes.scss' );
const INPUT_ROOT_FILE = join( __dirname, '..', 'src', 'calypso-color-schemes-root.scss' );
const OUTPUT_FILE = join( __dirname, '..', 'css', 'index.css' );
const OUTPUT_ROOT_FILE = join( __dirname, '..', 'root-only', 'index.css' );
const OUTPUT_JS_FILE = join( __dirname, '..', 'js', 'index.js' );

if ( ! existsSync( dirname( OUTPUT_FILE ) ) ) {
	mkdirSync( dirname( OUTPUT_FILE ), { recursive: true } );
}

if ( ! existsSync( dirname( OUTPUT_ROOT_FILE ) ) ) {
	mkdirSync( dirname( OUTPUT_ROOT_FILE ), { recursive: true } );
}

if ( ! existsSync( dirname( OUTPUT_JS_FILE ) ) ) {
	mkdirSync( dirname( OUTPUT_JS_FILE ), { recursive: true } );
}

const output = renderSync( { file: INPUT_FILE } );

writeFileSync( OUTPUT_FILE, output.css );

const rootOutput = renderSync( { file: INPUT_ROOT_FILE } );

writeFileSync( OUTPUT_ROOT_FILE, rootOutput.css );

// export CSS properties into a JavaScript file, so whoever uses it doesn't need to parse CSS over and over
postcss( [
	postcssCustomProperties( {
		importFrom: OUTPUT_FILE,
		exportTo: [ OUTPUT_JS_FILE ],
	} ),
] )
	.process( output.css, { from: INPUT_FILE } )
	.catch( ( e ) => {
		console.error( 'calypso-color-schemes', e );
	} );
