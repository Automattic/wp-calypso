const fs = require( 'fs' );
const path = require( 'path' );
const doctrine = require( 'doctrine' );
const { camelCase, forEach } = require( 'lodash' );

const REGEXP_DOCBLOCKS = /\/\*\* *\n( *\*.*\n)* *\*\//g;
const SELECTORS_DIR = 'client/state/selectors';
const DEST_DIR = 'build';
const DEST_FILE = 'devdocs-selectors-index.json';

// Omit index, system files, and subdirectories
const files = fs
	.readdirSync( SELECTORS_DIR )
	.filter( ( file ) => file !== 'index.js' && file.endsWith( '.js' ) );

const selectors = files.map( ( file ) => {
	const selector = { name: camelCase( path.basename( file, '.js' ) ) };

	const contents = fs.readFileSync( path.join( SELECTORS_DIR, file ), 'utf8' );
	forEach( contents.match( REGEXP_DOCBLOCKS ), ( docblock ) => {
		const doc = doctrine.parse( docblock, { unwrap: true } );
		if ( doc.tags.length > 0 ) {
			Object.assign( selector, doc );
			return false;
		}
	} );

	return selector;
} );

selectors.sort( ( a, b ) => a.name > b.name );

fs.mkdirSync( DEST_DIR, { recursive: true } );
fs.writeFileSync( path.join( DEST_DIR, DEST_FILE ), JSON.stringify( selectors, null, 2 ) );
