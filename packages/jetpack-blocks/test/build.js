/* eslint-disable import/no-nodejs-modules */
/**
 * External dependencies
 */
import { join } from 'path';
import { readFile } from 'fs';
import webpack from 'webpack';

describe( 'jetpack-blocks-build', () => {
	test( 'builds-as-expected', () => {
		return new Promise( ( resolve, reject ) => {
			const getWebpackConfig = require( '../webpack.config' );
			const config = getWebpackConfig();

			config.entry = { test: join( __dirname, 'fixtures', 'test.js' ) };
			config.output.path = join( __dirname, 'results' );
			config.output.pathinfo = false;
			config.devtool = false;

			// Babel depends on NODE_ENV when build is run
			const tempNodeEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'production';
			webpack( config, buildError => {
				process.env.NODE_ENV = tempNodeEnv;
				if ( buildError ) {
					return reject( buildError );
				}
				readFile( join( __dirname, 'results', 'test.js' ), 'utf8', ( readError, contents ) => {
					if ( readError ) {
						return reject( readError );
					}
					expect( contents ).toMatchSnapshot();
					resolve();
				} );
			} );
		} );
	}, 30000 );
} );
