/**
 * External dependencies
 */
import { camelCase, forEach, once } from 'lodash';
import fs from 'fs';
import path from 'path';
import express from 'express';
import Fuse from 'fuse.js';
import doctrine from 'doctrine';

/**
 * Constants
 */

const REGEXP_DOCBLOCKS = /\/\*\* *\n( *\*.*\n)* *\*\//g;
const SELECTORS_DIR = path.resolve( __dirname, '../../../../client/state/selectors' );

function parseSelectorFile( file ) {
	return new Promise( ( resolve, reject ) => {
		fs.readFile( path.join( SELECTORS_DIR, file ), 'utf8', ( error, contents ) => {
			if ( error ) {
				return reject( error );
			}

			const selector = {
				name: camelCase( path.basename( file, '.js' ) ),
			};

			forEach( contents.match( REGEXP_DOCBLOCKS ), ( docblock ) => {
				const doc = doctrine.parse( docblock, { unwrap: true } );
				if ( doc.tags.length > 0 ) {
					Object.assign( selector, doc );
					return false;
				}
			} );

			resolve( selector );
		} );
	} );
}

export const primeSelectorsCache = once( () => {
	return new Promise( ( resolve ) => {
		fs.readdir( SELECTORS_DIR, ( error, files ) => {
			if ( error ) {
				files = [];
			}

			// Omit index, system files, and subdirectories
			files = files.filter( ( file ) => 'index.js' !== file && /\.js$/.test( file ) );

			Promise.all( files.map( parseSelectorFile ) ).then( ( selectors ) => {
				// Sort selectors by name alphabetically
				selectors.sort( ( a, b ) => a.name > b.name );

				resolve(
					new Fuse( selectors, {
						keys: [
							{
								name: 'name',
								weight: 0.9,
							},
							{
								name: 'description',
								weight: 0.1,
							},
						],
						threshold: 0.4,
						distance: 20,
					} )
				);
			} );
		} );
	} );
} );

export const selectorsRouter = express.Router();

selectorsRouter.get( '/', ( request, response ) => {
	primeSelectorsCache()
		.then( ( fuse ) => {
			let results;
			if ( request.query.search ) {
				results = fuse.search( request.query.search );
			} else {
				results = fuse.list;
			}

			response.json( results );
		} )
		.catch( ( error ) => {
			response.status( 500 ).json( error );
		} );
} );
