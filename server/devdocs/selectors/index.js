/**
 * External dependencies
 */
const chalk = require( 'chalk' );
const fs = require( 'fs' );
const jsdoc = require( 'jsdoc-api' );
const path = require( 'path' );
const express = require( 'express' );
const Fuse = require( 'fuse.js' );
const camelCase = require( 'lodash/camelCase' );
const find = require( 'lodash/find' );
const matchesProperty = require( 'lodash/matchesProperty' );

/**
 * Constants
 */

const SELECTORS_DIR = path.resolve( __dirname, '../../../client/state/selectors' );

/**
 * Module variables
 */

const router = express.Router();
let prepareFuse;

const parseSelectorFile = file =>
	jsdoc.explain( { cache: true, files: path.resolve( SELECTORS_DIR, file ) } )
		.then( ast => {
			const expectedExport = camelCase( path.basename( file, '.js' ) );

			const actualExport = find( ast, matchesProperty( 'alias', expectedExport ) );

			if ( ! actualExport ) {
				console.warn(
					chalk.red( '\nWARNING: ' ) +
					chalk.yellow( 'Could not find expected exported function.\n' ) +
					chalk.yellow( 'Based on the filename: ' ) +
					chalk.blue( path.basename( file ) ) +
					chalk.yellow( '\nWe expected to find a function with ' ) +
					chalk.blue( '@alias ' + expectedExport ) +
					chalk.yellow( ' in its JSDoc header\n' )
				);

				throw new Error( 'Could not find expected selector' );
			}

			return actualExport;
		} )
		.catch( error => {
			console.warn( error );
			return null;
		} );

function prime() {
	prepareFuse = new Promise( ( resolve, reject ) => {
		fs.readdir( SELECTORS_DIR, ( error, files ) => {
			if ( error ) {
				files = [];
			}

			// Omit index, system files, and subdirectories
			files = files.filter( ( file ) => 'index.js' !== file && /\.js$/.test( file ) );

			Promise.all( files.map( parseSelectorFile ) ).then( ( selectors ) => {
				// Sort selectors by name alphabetically
				selectors.filter( a => a ).sort( ( a, b ) => a.name > b.name );

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
			} ).catch( () => reject( 'Parse failure' ) );
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
