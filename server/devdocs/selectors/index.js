/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const espree = require( 'espree' );
const fs = require( 'fs' );
const jsdoc = require( 'jsdoc-api' );
const path = require( 'path' );
const express = require( 'express' );
const Fuse = require( 'fuse.js' );
const camelCase = require( 'lodash/camelCase' );
const get = require( 'lodash/get' );

/**
 * Constants
 */

const SELECTORS_DIR = path.resolve( __dirname, '../../../client/state/selectors' );

/**
 * Module variables
 */

const router = express.Router();
let prepareFuse;

const defaultExportOf = ast => ast.body.find( ( { type } ) => type === 'ExportDefaultDeclaration' );
const functionByName = ( ast, name ) => {
	const exports = ast
		.body
		.filter( ( { type } ) => type === 'ExportNamedDeclaration' )
		.find( ( { declaration } ) => (
			( 'FunctionDeclaration' === declaration.type && name === declaration.id.name ) ||
			(
				'VariableDeclaration' === declaration.type &&
				declaration.declarations && declaration.declarations[ 0 ] &&
				declaration.declarations[ 0 ].id.name === name
			)
		) );

	if ( exports ) {
		return exports;
	}

	// find non-exported function declarations
	return ast
		.body
		.filter( ( { type } ) => (
			( type === 'VariableDeclaration' ) ||
			( type === 'VariableDeclarator' )
		) )
		.find( ( { declarations } ) => (
			declarations && declarations[ 0 ] &&
			declarations[ 0 ].id === name
		) );
};

const jsParse = contents => {
	try {
		return espree.parse( contents, {
			attachComment: true,
			ecmaVersion: 6,
			sourceType: 'module',
			ecmaFeatures: {
				experimentalObjectRestSpread: true,
			}
		} );
	} catch ( e ) {
		console.log( e.message );
		return null;
	}
};

const defaultExportFunctionOf = ast => {
	const defaultExport = defaultExportOf( ast );
	const exportType = get( defaultExport, 'declaration.type' );

	if ( 'FunctionDeclaration' === exportType ) {
		return defaultExport;
	}

	if ( 'ArrowFunctionExpression' === exportType ) {
		return defaultExport;
	}

	if ( 'Identifier' === exportType ) {
		return functionByName( ast, defaultExport.declaration.name );
	}

	if ( 'CallExpression' === exportType ) {
		return functionByName( ast, defaultExport.declaration.callee.name );
	}

	return null;
};

const parseSelectorFile = file => new Promise( resolve => {
	const contents = fs.readFileSync( path.resolve( SELECTORS_DIR, file ), { encoding: 'utf8' } );
	const ast = jsParse( contents );

	if ( ! ast ) {
		console.warn(
			chalk.red( '\nWARNING: ' ) +
			chalk.yellow( 'Could not parse file: ' ) +
			chalk.blue( path.basename( file ) )
		);
		return resolve( null );
	}

	const expectedExport = camelCase( path.basename( file, '.js' ) );
	const defaultExport = defaultExportFunctionOf( ast );
	if ( ! defaultExport ) {
		console.log( JSON.stringify( defaultExport, null, 2 ) );
		console.warn(
			chalk.red( '\nWARNING: ' ) +
			chalk.yellow( 'Could not find default-exported function' ) +
			chalk.yellow( '\nBased on the filename: ' ) +
			chalk.blue( path.basename( file ) ) +
			chalk.yellow( '\nWe expected to find an exported function with name ' ) +
			chalk.blue( expectedExport )
		);
		return resolve( null );
	}

	const { leadingComments: comments } = defaultExport;
	if ( ! comments || ! comments[ 0 ] || 'Block' !== comments[ 0 ].type ) {
		console.warn(
			chalk.red( '\nWARNING: ' ) +
			chalk.yellow( 'Found no JSDoc block comments for selector in ' ) +
			chalk.blue( path.basename( file ) )
		);
		return resolve( null );
	}

	// add a dummy export so that JSDoc parses the block
	const source = `/*${ comments[ 0 ].value }*/function ${ expectedExport }() {}`;
	try {
		const [ docblock, /* module info */ ] = jsdoc.explainSync( { source } );

		return resolve( docblock );
	} catch ( e ) {
		console.warn(
			chalk.red( '\nWARNING: ' ) +
			chalk.yellow( 'Could not parse JSDoc block comment in ' ) +
			chalk.blue( path.basename( file ) )
		);

		return resolve( null );
	}
} );

function prime() {
	if ( prepareFuse ) {
		return prepareFuse;
	}

	prepareFuse = new Promise( ( resolve, reject ) => {
		fs.readdir( SELECTORS_DIR, ( error, files ) => {
			if ( error ) {
				files = [];
			}
			console.warn( chalk.red( '\nPRIMING' ) );

			// Omit index, system files, and subdirectories
			files = files.filter( ( file ) => 'index.js' !== file && /\.js$/.test( file ) );

			Promise.all( files.map( parseSelectorFile ) ).then( rawSelectors => {
				// Sort selectors by name alphabetically
				const selectors = rawSelectors.filter( a => a ).sort( ( a, b ) => a.name > b.name );
				console.log( chalk.yellow( `Found ${ selectors.length } selectors` ) );

				resolve( new Fuse( selectors, {
					keys: [ {
						name: 'name',
						weight: 0.9
					}, {
						name: 'description',
						weight: 0.1
					} ],
					threshold: 0.4,
					distance: 20
				} ) );
			} ).catch( e => {
				console.error( e );
				reject( 'Parse failure' );
			} );
		} );
	} ).then( ( fuse ) => {
		prepareFuse = Promise.resolve( fuse );
		return fuse;
	} );
}

router.get( '/', ( request, response ) => {
	prepareFuse.then( ( fuse ) => {
		let results;
		if ( request.query.search ) {
			results = fuse.search( request.query.search );
		} else {
			results = fuse.list;
		}

		response.json( results );
	} ).catch( ( error ) => {
		response.status( 500 ).json( error );
	} );
} );

module.exports.prime = prime;
module.exports.router = router;
