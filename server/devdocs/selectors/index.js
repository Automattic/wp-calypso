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

/**
 * Internal dependencies
 */
import { defaultExport, defaultFunction } from './default-exports';
import { getComment } from './function-comments';

/**
 * Constants
 */

const SELECTORS_DIR = path.resolve( __dirname, '../../../client/state/selectors' );

/**
 * Module variables
 */

const router = express.Router();
let prepareFuse;

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

const parseSelectorFile = file => new Promise( resolve => {
	const contents = fs.readFileSync( path.resolve( SELECTORS_DIR, file ), { encoding: 'utf8' } );
	const ast = jsParse( contents );

	if ( ! ast ) {
		console.warn(
			chalk.red( '\nWarning: ' ) +
			chalk.yellow( 'Could not parse file: ' ) +
			chalk.blue( path.basename( file ) )
		);
		return resolve( null );
	}

	const expectedName = camelCase( path.basename( file, '.js' ) );

	// if the default export has a comment attached to it
	// then we don't need to jump to the referenced declaration
	const moduleExport = defaultExport( ast );
	const defaultComment = getComment( moduleExport );
	const defaultNode = defaultComment
		? moduleExport
		: defaultFunction( ast );

	if ( ! defaultNode ) {
		console.warn(
			chalk.red( '\nWarning: ' ) +
			chalk.yellow( 'Could not find default-exported function' ) +
			chalk.yellow( '\nBased on the filename: ' ) +
			chalk.blue( path.basename( file ) ) +
			chalk.yellow( '\nWe expected to find an exported function with name ' ) +
			chalk.blue( expectedName )
		);
		return resolve( null );
	}

	const comment = getComment( defaultNode );
	if ( ! comment ) {
		console.warn(
			chalk.red( '\nWarning: ' ) +
			chalk.yellow( 'Found no JSDoc block comments for selector in ' ) +
			chalk.blue( path.basename( file ) )
		);
		return resolve( null );
	}

	// add a dummy export so that JSDoc parses the block
	const source = `/*${ comment }*/function ${ expectedName }() {}`;
	try {
		const [ docblock, /* module info */ ] = jsdoc.explainSync( { source } );

		return resolve( docblock );
	} catch ( e ) {
		console.warn(
			chalk.red( '\nWarning: ' ) +
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
			console.warn( chalk.yellow( '\nPriming selector search cache' ) );

			// Omit index, system files, and subdirectories
			files = files.filter( ( file ) => 'index.js' !== file && /\.js$/.test( file ) );

			const ticBeforeParsing = process.hrtime();
			Promise.all( files.map( parseSelectorFile ) ).then( rawSelectors => {
				const [ parseDuration, /* ns */ ] = process.hrtime( ticBeforeParsing );
				// Sort selectors by name alphabetically
				const selectors = rawSelectors.filter( a => a ).sort( ( a, b ) => a.name > b.name );
				console.log( chalk.yellow( `Found ${ selectors.length } selectors in ${ parseDuration }s` ) );

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
				reject( 'Could not parse selectors' );
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
