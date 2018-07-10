/**
 * External dependencies
 */
import { access, unlink } from 'fs';
import path from 'path';
import { promisify } from 'util';
import webpack from 'webpack';

/**
 * Internal dependencies
 */
import config from './fixtures/webpack.config.js';

/**
 * Local variables
 */
const accessAsync = promisify( access );
const unlinkAsync = promisify( unlink );
const webpackAsync = promisify( webpack );

describe( 'CustomTemplatedPathPlugin', () => {
	const outputFile = path.join( __dirname, '/fixtures/build/entry.js' );

	beforeAll( async () => {
		// Remove output file so as not to report false positive from previous
		// test. Absorb error since the file may not exist (unlink will throw).
		try {
			await unlinkAsync( outputFile );
		} catch ( error ) {}
	} );

	it( 'should resolve with basename output', async () => {
		await webpackAsync( config );
		await accessAsync( outputFile );
	} );
} );
