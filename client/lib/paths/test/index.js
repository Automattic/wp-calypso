/** @format */

/**
 * External dependencies
 */

import { expect } from 'chai';

/**
 * Internal dependencies
 */
import paths from '../';

/**
 * Module variables
 */
var DUMMY_SITE = {
	ID: 73693298,
	slug: 'settingstestsite.wordpress.com',
};

describe( 'index', () => {
	describe( '#newPost()', () => {
		test( 'should return the Calypso root post path no site', () => {
			var url = paths.newPost();

			expect( url ).to.equal( '/post' );
		} );

		test( 'should return a Calypso site-prefixed post path if site exists', () => {
			var url = paths.newPost( DUMMY_SITE );

			expect( url ).to.equal( '/post/' + DUMMY_SITE.slug );
		} );
	} );

	describe( '#newPage()', () => {
		test( 'should return the Calypso root page path no site', () => {
			var url = paths.newPage();

			expect( url ).to.equal( '/page' );
		} );

		test( 'should return a Calypso site-prefixed page path if site exists', () => {
			var url = paths.newPage( DUMMY_SITE );

			expect( url ).to.equal( '/page/' + DUMMY_SITE.slug );
		} );
	} );

	describe( '#publicizeConnections()', () => {
		test( 'should return the root sharing path if no site specified', () => {
			var url = paths.publicizeConnections();

			expect( url ).to.equal( '/sharing' );
		} );

		test( 'should return a Calypso site-suffixed sharing path if site specified', () => {
			var url = paths.publicizeConnections( DUMMY_SITE );

			expect( url ).to.equal( '/sharing/' + DUMMY_SITE.slug );
		} );
	} );
} );
