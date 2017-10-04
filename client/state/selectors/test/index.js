/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { camelCase, each, kebabCase } from 'lodash';
import fs from 'fs';
import path from 'path';

/**
 * Internal dependencies
 */
import * as selectors from '../';

/**
 * Constants
 */

/**
 * Matches string which ends in ".js" file extension
 *
 * @type {RegExp}
 */
const RX_JS_EXTENSION = /\.js$/;

describe( 'selectors', () => {
	it( 'should match every selector to its default export', () => {
		each( selectors, ( selector, key ) => {
			const module = require( '../' + kebabCase( key ) );
			const defaultExport = module.default ? module.default : module;
			expect( defaultExport ).to.equal( selector );
		} );
	} );

	it( 'should export every selector file', done => {
		fs.readdir( path.join( __dirname, '..' ), ( error, files ) => {
			if ( error ) {
				return done( error );
			}

			each( files, file => {
				if ( ! RX_JS_EXTENSION.test( file ) || 'index.js' === file ) {
					return;
				}

				const exportName = camelCase( file.replace( RX_JS_EXTENSION, '' ) );
				const errorMessage = `Expected to find selector \`${ exportName }\` (${ file }) in index.js exports.`;
				expect( selectors, errorMessage ).to.include.keys( exportName );
			} );

			done();
		} );
	} );
} );
