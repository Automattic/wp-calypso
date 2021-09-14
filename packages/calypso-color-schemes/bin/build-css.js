/* eslint-disable import/no-nodejs-modules */
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import postcssCustomProperties from 'postcss-custom-properties';
import sass from 'sass';

const { renderSync } = sass;
const __dirname = dirname( fileURLToPath( import.meta.url ) );

const INPUT_FILE = join( __dirname, '..', 'src', 'calypso-color-schemes.scss' );
const OUTPUT_FILE = join( __dirname, '..', 'css', 'index.css' );
const OUTPUT_JS_FILE = join( __dirname, '..', 'js', 'index.mjs' );

if ( ! existsSync( dirname( OUTPUT_FILE ) ) ) {
	mkdirSync( dirname( OUTPUT_FILE ), { recursive: true } );
}

if ( ! existsSync( dirname( OUTPUT_JS_FILE ) ) ) {
	mkdirSync( dirname( OUTPUT_JS_FILE ), { recursive: true } );
}

const output = renderSync( { file: INPUT_FILE } );

writeFileSync( OUTPUT_FILE, output.css );

// export CSS properties into a JavaScript file, so whoever uses it doesn't need to parse CSS over and over
postcss( [
	postcssCustomProperties( {
		importFrom: OUTPUT_FILE,
		exportTo: [ OUTPUT_JS_FILE ],
	} ),
] )
	.process( output.css, { from: INPUT_FILE } )
	.catch( ( e ) => {
		// eslint-disable-next-line no-console
		console.error( 'calypso-color-schemes', e );
	} );
