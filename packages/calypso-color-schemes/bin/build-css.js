/* eslint-disable import/no-nodejs-modules */
import { mkdirSync, writeFileSync, renameSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import postcss from 'postcss';
import postcssCustomProperties from 'postcss-custom-properties';
import sass from 'sass';

const { renderSync } = sass;
const __dirname = dirname( fileURLToPath( import.meta.url ) );

const INPUT_FILE = join( __dirname, '..', 'src', 'calypso-color-schemes.scss' );
const OUTPUT_FILE = join( __dirname, '..', 'css', 'index.css' );
const OUTPUT_JS_FILE = join( __dirname, '..', 'js', 'index.js' );
const OUTPUT_CJS_FILE = join( __dirname, '..', 'js', 'index.cjs' );
const OUTPUT_MJS_FILE = join( __dirname, '..', 'js', 'index.mjs' );
const OUTPUT_JSON_FILE = join( __dirname, '..', 'json', 'index.json' );

[ OUTPUT_FILE, OUTPUT_JS_FILE, OUTPUT_MJS_FILE, OUTPUT_JSON_FILE ]
	.map( ( file ) => dirname( file ) )
	.forEach( ( dir ) => mkdirSync( dir, { recursive: true } ) );

const output = renderSync( { file: INPUT_FILE } );
writeFileSync( OUTPUT_FILE, output.css );

// export CSS properties into a JavaScript and JSON files, so whoever uses it doesn't need to parse CSS over and over
postcss( [
	postcssCustomProperties( {
		importFrom: OUTPUT_FILE,
		exportTo: [ OUTPUT_JS_FILE, OUTPUT_MJS_FILE, OUTPUT_JSON_FILE ],
	} ),
] )
	.process( output.css, { from: INPUT_FILE } )
	.then( () => {
		// postcss-custom-properties ony knows how to export .js (will contain CJS) and .mjs.
		// However, as this module is an ESM module, Node will assume that the .js file contains ESM, not CJS.
		//
		// To fix it, we rename .js to .cjs, and .mjs to .js
		renameSync( OUTPUT_JS_FILE, OUTPUT_CJS_FILE );
		renameSync( OUTPUT_MJS_FILE, OUTPUT_JS_FILE );
	} )
	.catch( ( e ) => {
		throw e;
	} );
